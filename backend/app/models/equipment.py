from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from ..database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(String, nullable=False)
    brand = Column(String)
    model = Column(String)
    serial_number = Column(String, unique=True, index=True)
    status = Column(String, default="available")  # available | assigned | returned | maintenance
    assigned_date = Column(DateTime)
    returned_date = Column(DateTime)
    notes = Column(String)
    created_at = Column(DateTime, server_default=func.now())
