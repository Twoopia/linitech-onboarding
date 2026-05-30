from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChecklistItemOut(BaseModel):
    id: int
    employee_id: int
    title: str
    description: Optional[str] = None
    category: str
    responsible: Optional[str] = None
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChecklistItemUpdate(BaseModel):
    completed: bool
