from fastapi import APIRouter
from app.api.v1.endpoints import (
    tenants, 
    tenant_admins, 
    auth, 
    players, 
    game_providers, 
    games,
    tenant_games,  # 1. Add this import
    tenant_stats,
    player_lobby,
    gameplay
)
from app.api.v1.endpoints import payments
from app.api.v1.endpoints.kyc_common import router as kyc_common_router
from app.api.v1.endpoints.super_admin_kyc import router as super_admin_kyc_router
from app.api.v1.endpoints.tenant_admin_kyc import router as tenant_admin_kyc_router
from app.api.v1.endpoints import tenant_bonuses
from app.api.v1.endpoints import player_bonuses
from app.api.v1.endpoints import tenant_jackpots # 🎯 1. Import it
from app.api.v1.endpoints import player_jackpots # 🎯 2. Import player side too
from app.api.v1.endpoints import player_analytics # 🎯 2. Import player side too

# app/api/v1/api.py

from app.api.v1.endpoints import tenant_analytics 





api_router = APIRouter()

# Authentication & Admin Management
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["Tenants"])
api_router.include_router(tenant_admins.router, prefix="/tenant-admins", tags=["Tenant Admins"])
api_router.include_router(tenant_stats.router,prefix="/tenant/stats", tags=["Tenant Stats"])
# Core Entities
api_router.include_router(players.router, prefix="/players", tags=["Players"])
api_router.include_router(game_providers.router, prefix="/game-providers", tags=["Game Providers"])
api_router.include_router(games.router, prefix="/games", tags=["Games"])

# 2. Add the Tenant Marketplace router
api_router.include_router(tenant_games.router, prefix="/tenant/games", tags=["Tenant Games"])

api_router.include_router(player_lobby.router, prefix="/player", tags=["Player Lobby"])
api_router.include_router(gameplay.router, prefix="/gameplay", tags=["Gameplay"])
api_router.include_router(payments.router, tags=["Payments"])

api_router.include_router(kyc_common_router, prefix="/kyc", tags=["KYC Common"])
api_router.include_router(super_admin_kyc_router)  # already has /admin/kyc prefix
api_router.include_router(tenant_admin_kyc_router) # already has /tenant-admin/kyc prefix
api_router.include_router(tenant_bonuses.router)
api_router.include_router(player_bonuses.router)

api_router.include_router(tenant_jackpots.router)
api_router.include_router(player_jackpots.router)

# 🎯 2. Register the Analytics Router
api_router.include_router(tenant_analytics.router)
api_router.include_router(player_analytics.router)

