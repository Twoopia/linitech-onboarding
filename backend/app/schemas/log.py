from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LogOut(BaseModel):
    id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    user: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
