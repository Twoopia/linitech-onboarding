from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime

VALID_STATUSES = {"pending", "in_progress", "completed", "inactive"}


class EmployeeBase(BaseModel):
    name: str
    email: str
    department: str
    position: str
    manager: Optional[str] = None
    start_date: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    position: Optional[str] = None
    manager: Optional[str] = None
    start_date: Optional[str] = None
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"Status inválido. Use: {', '.join(sorted(VALID_STATUSES))}")
        return v


class EmployeeOut(EmployeeBase):
    id: int
    username: Optional[str] = None
    temp_password: Optional[str] = None
    corporate_email: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
