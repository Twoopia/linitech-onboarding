from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EquipmentBase(BaseModel):
    type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: str
    notes: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class EquipmentAssign(BaseModel):
    employee_id: int


class EquipmentOut(EquipmentBase):
    id: int
    employee_id: Optional[int] = None
    status: str
    assigned_date: Optional[datetime] = None
    returned_date: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
