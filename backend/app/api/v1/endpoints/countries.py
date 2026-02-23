from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.country import Country

router = APIRouter(prefix="/countries", tags=["Countries"])


@router.get("")
def list_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()
