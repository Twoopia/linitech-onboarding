from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..schemas.log import LogOut
from ..services.log_service import get_logs

router = APIRouter()


@router.get("/", response_model=list[LogOut])
def list_logs(entity: Optional[str] = None, limit: int = 100, db: Session = Depends(get_db)):
    return get_logs(db, entity=entity, limit=limit)
