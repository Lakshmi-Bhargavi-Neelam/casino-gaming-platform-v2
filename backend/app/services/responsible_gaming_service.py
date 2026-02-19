# app/services/responsible_gaming_service.py
"""
Responsible Gaming Service

Handles player-set limits for responsible gaming compliance:
- Daily deposit limits
- Daily loss limits
- Session limits (3 hours max)
- Daily wagering limits

Rules:
- Reductions apply immediately
- Increases require 24-72 hour cooling period (configurable)
- Limits are tenant-isolated (per casino)
"""
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import UUID
from typing import Optional, List

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException

from app.models.player_limit import PlayerLimit
from app.schemas.player_limit import (
    PlayerLimitCreate,
    PlayerLimitUpdate,
    PlayerLimitResponse,
    LimitCheckResponse
)


# Configuration
INCREASE_COOLDOWN_HOURS = 24  # Hours before limit increase takes effect
SESSION_LIMIT_DEFAULT_MINUTES = 180  # 3 hours default session limit


class ResponsibleGamingService:
    """Service for managing responsible gaming limits."""

    # -----------------------------
    # Set / Update Limit
    # -----------------------------
    @staticmethod
    def set_limit(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        payload: PlayerLimitCreate
    ) -> PlayerLimit:
        """
        Set a responsible gaming limit.

        - If no existing limit: Create new (active immediately)
        - If new value < existing: Update immediately (reduction)
        - If new value > existing: Create pending (24hr delay)
        """
        now = datetime.now()

        # Check for existing active or pending limit of same type
        existing = db.query(PlayerLimit).filter(
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id,
            PlayerLimit.limit_type == payload.limit_type,
            PlayerLimit.period == payload.period,
            PlayerLimit.status.in_(["ACTIVE", "PENDING_INCREASE"])
        ).first()

        new_value = Decimal(str(payload.limit_value))

        if existing:
            # Compare with existing active limit value
            current_value = existing.limit_value

            if new_value < current_value:
                # REDUCTION: Apply immediately
                existing.limit_value = new_value
                existing.status = "ACTIVE"
                existing.effective_at = now
                existing.requested_at = now
                existing.current_usage = Decimal("0.00")
                existing.period_start = now
                existing.updated_at = now
                db.commit()
                db.refresh(existing)
                return existing

            elif new_value > current_value:
                # INCREASE: Set pending with cooldown
                # Cancel any existing pending increase first
                db.query(PlayerLimit).filter(
                    PlayerLimit.player_id == player_id,
                    PlayerLimit.tenant_id == tenant_id,
                    PlayerLimit.limit_type == payload.limit_type,
                    PlayerLimit.status == "PENDING_INCREASE"
                ).update({"status": "CANCELLED"})

                # Create new pending limit
                pending = PlayerLimit(
                    player_id=player_id,
                    tenant_id=tenant_id,
                    limit_type=payload.limit_type,
                    limit_value=new_value,
                    period=payload.period,
                    status="PENDING_INCREASE",
                    current_usage=Decimal("0.00"),
                    effective_at=now + timedelta(hours=INCREASE_COOLDOWN_HOURS),
                    requested_at=now,
                    period_start=None  # Not active yet
                )
                db.add(pending)
                db.commit()
                db.refresh(pending)
                return pending

            else:
                # Same value - just return existing
                return existing

        # No existing limit - create new (active immediately)
        # Special handling for SESSION limit - default max is 3 hours
        if payload.limit_type == "SESSION" and payload.limit_value > SESSION_LIMIT_DEFAULT_MINUTES:
            raise HTTPException(
                status_code=400,
                detail=f"Session limit cannot exceed {SESSION_LIMIT_DEFAULT_MINUTES} minutes (3 hours)"
            )

        new_limit = PlayerLimit(
            player_id=player_id,
            tenant_id=tenant_id,
            limit_type=payload.limit_type,
            limit_value=new_value,
            period=payload.period,
            status="ACTIVE",
            current_usage=Decimal("0.00"),
            effective_at=now,
            requested_at=now,
            period_start=now
        )
        db.add(new_limit)
        db.commit()
        db.refresh(new_limit)
        return new_limit

    # -----------------------------
    # Get Player Limits
    # -----------------------------
    @staticmethod
    def get_player_limits(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        include_pending: bool = True
    ) -> List[PlayerLimitResponse]:
        """Get all limits for a player in a specific casino."""
        now = datetime.now()

        # Process any pending increases that are now due
        ResponsibleGamingService._process_pending_increases(db, player_id, tenant_id, now)

        query = db.query(PlayerLimit).filter(
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id,
            PlayerLimit.status.in_(["ACTIVE", "PENDING_INCREASE"] if include_pending else ["ACTIVE"])
        ).order_by(PlayerLimit.limit_type, PlayerLimit.created_at.desc())

        limits = query.all()

        # Build response with computed fields
        responses = []
        for limit in limits:
            remaining = None
            if limit.status == "ACTIVE" and limit.limit_value:
                remaining = float(limit.limit_value) - float(limit.current_usage or 0)
                if remaining < 0:
                    remaining = 0

            pending_increases_in = None
            if limit.status == "PENDING_INCREASE":
                pending_increases_in = int((limit.effective_at - now).total_seconds())
                if pending_increases_in < 0:
                    pending_increases_in = 0

            responses.append(PlayerLimitResponse(
                limit_id=limit.limit_id,
                player_id=limit.player_id,
                tenant_id=limit.tenant_id,
                limit_type=limit.limit_type,
                limit_value=float(limit.limit_value),
                period=limit.period,
                status=limit.status,
                current_usage=float(limit.current_usage or 0),
                effective_at=limit.effective_at,
                requested_at=limit.requested_at,
                period_start=limit.period_start,
                created_at=limit.created_at,
                updated_at=limit.updated_at,
                remaining=round(remaining, 2) if remaining is not None else None,
                is_pending=limit.status == "PENDING_INCREASE",
                pending_increases_in=pending_increases_in
            ))

        return responses

    # -----------------------------
    # Get Single Limit
    # -----------------------------
    @staticmethod
    def get_limit_by_type(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        limit_type: str,
        period: str = "DAILY"
    ) -> Optional[PlayerLimit]:
        """Get the active limit for a specific type."""
        now = datetime.now()

        # Process pending increases first
        ResponsibleGamingService._process_pending_increases(db, player_id, tenant_id, now)

        return db.query(PlayerLimit).filter(
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id,
            PlayerLimit.limit_type == limit_type,
            PlayerLimit.period == period,
            PlayerLimit.status == "ACTIVE"
        ).first()

    # -----------------------------
    # Check Limit (Before Action)
    # -----------------------------
    @staticmethod
    def check_limit(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        limit_type: str,
        amount: float,
        period: str = "DAILY"
    ) -> LimitCheckResponse:
        """
        Check if an action would exceed the player's limit.

        Returns whether the action is within limit and remaining allowance.
        """
        limit = ResponsibleGamingService.get_limit_by_type(
            db, player_id, tenant_id, limit_type, period
        )

        if not limit:
            # No limit set - allow
            return LimitCheckResponse(
                within_limit=True,
                current_usage=0,
                limit_value=0,
                remaining=float('inf'),
                message="No limit set"
            )

        limit_value = float(limit.limit_value)
        current_usage = float(limit.current_usage or 0)
        remaining = limit_value - current_usage

        within_limit = (current_usage + amount) <= limit_value

        message = None
        if not within_limit:
            message = f"This action would exceed your {limit_type.lower()} limit of ${limit_value:.2f}"

        return LimitCheckResponse(
            within_limit=within_limit,
            current_usage=round(current_usage, 2),
            limit_value=limit_value,
            remaining=max(0, round(remaining, 2)),
            message=message
        )

    # -----------------------------
    # Update Usage (After Action)
    # -----------------------------
    @staticmethod
    def update_usage(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        limit_type: str,
        amount: float,
        period: str = "DAILY"
    ) -> bool:
        """
        Update the current usage for a limit after an action.

        Returns True if successful, raises exception if limit exceeded.
        """
        now = datetime.now()

        limit = db.query(PlayerLimit).filter(
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id,
            PlayerLimit.limit_type == limit_type,
            PlayerLimit.period == period,
            PlayerLimit.status == "ACTIVE"
        ).with_for_update().first()

        if not limit:
            return True  # No limit, nothing to update

        # Check if period needs reset
        if limit.period_start:
            period_end = ResponsibleGamingService._get_period_end(limit.period_start, limit.period)
            if now > period_end:
                # Reset for new period
                limit.current_usage = Decimal("0.00")
                limit.period_start = now

        # Update usage
        new_usage = float(limit.current_usage or 0) + amount
        limit_value = float(limit.limit_value)

        if new_usage > limit_value:
            raise HTTPException(
                status_code=400,
                detail=f"This action exceeds your {limit_type.lower()} limit"
            )

        limit.current_usage = Decimal(str(round(new_usage, 2)))
        limit.updated_at = now
        db.commit()

        return True

    # -----------------------------
    # Remove / Cancel Limit
    # -----------------------------
    @staticmethod
    def remove_limit(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        limit_id: UUID
    ) -> dict:
        """Remove or cancel a limit."""
        limit = db.query(PlayerLimit).filter(
            PlayerLimit.limit_id == limit_id,
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id
        ).first()

        if not limit:
            raise HTTPException(status_code=404, detail="Limit not found")

        # Can only cancel pending increases immediately
        if limit.status == "PENDING_INCREASE":
            limit.status = "CANCELLED"
            db.commit()
            return {"message": "Pending limit increase cancelled"}

        # For active limits, require the same cooldown period
        # (Can't just remove limits - regulatory requirement)
        raise HTTPException(
            status_code=400,
            detail="Active limits cannot be removed immediately. "
                   "Set the limit to a higher value instead (24hr cooldown applies)."
        )

    # -----------------------------
    # Cancel Pending Increase
    # -----------------------------
    @staticmethod
    def cancel_pending_increase(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        limit_id: UUID
    ) -> dict:
        """Cancel a pending limit increase."""
        limit = db.query(PlayerLimit).filter(
            PlayerLimit.limit_id == limit_id,
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id,
            PlayerLimit.status == "PENDING_INCREASE"
        ).first()

        if not limit:
            raise HTTPException(status_code=404, detail="Pending limit not found")

        limit.status = "CANCELLED"
        db.commit()

        return {"message": "Pending limit increase cancelled successfully"}

    # -----------------------------
    # Helper: Process Pending Increases
    # -----------------------------
    @staticmethod
    def _process_pending_increases(
        db: Session,
        player_id: UUID,
        tenant_id: UUID,
        now: datetime
    ):
        """Activate any pending increases that are due."""
        pending_limits = db.query(PlayerLimit).filter(
            PlayerLimit.player_id == player_id,
            PlayerLimit.tenant_id == tenant_id,
            PlayerLimit.status == "PENDING_INCREASE",
            PlayerLimit.effective_at <= now
        ).all()

        for pending in pending_limits:
            # Deactivate the old active limit
            db.query(PlayerLimit).filter(
                PlayerLimit.player_id == player_id,
                PlayerLimit.tenant_id == tenant_id,
                PlayerLimit.limit_type == pending.limit_type,
                PlayerLimit.period == pending.period,
                PlayerLimit.status == "ACTIVE"
            ).update({"status": "EXPIRED"})

            # Activate the pending limit
            pending.status = "ACTIVE"
            pending.period_start = now
            pending.current_usage = Decimal("0.00")

        if pending_limits:
            db.commit()

    # -----------------------------
    # Helper: Get Period End
    # -----------------------------
    @staticmethod
    def _get_period_end(period_start: datetime, period: str) -> datetime:
        """Calculate when a limit period ends."""
        if period == "DAILY":
            return period_start + timedelta(days=1)
        elif period == "WEEKLY":
            return period_start + timedelta(weeks=1)
        elif period == "MONTHLY":
            return period_start + timedelta(days=30)
        return period_start + timedelta(days=1)

    # -----------------------------
    # Get Limit Summary
    # -----------------------------
    @staticmethod
    def get_limit_summary(
        db: Session,
        player_id: UUID,
        tenant_id: UUID
    ) -> dict:
        """Get a summary of all limits with usage stats."""
        limits = ResponsibleGamingService.get_player_limits(db, player_id, tenant_id)

        summary = {
            "has_limits": len(limits) > 0,
            "limits": {},
            "pending_changes": []
        }

        for limit in limits:
            key = f"{limit.limit_type}_{limit.period}"

            if limit.is_pending:
                summary["pending_changes"].append({
                    "type": limit.limit_type,
                    "period": limit.period,
                    "new_value": limit.limit_value,
                    "activates_in_seconds": limit.pending_increases_in,
                    "activates_at": limit.effective_at
                })
            else:
                summary["limits"][key] = {
                    "limit_value": limit.limit_value,
                    "current_usage": limit.current_usage,
                    "remaining": limit.remaining,
                    "period": limit.period,
                    "period_start": limit.period_start
                }

        return summary
