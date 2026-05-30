from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    department = Column(String, nullable=False)
    position = Column(String, nullable=False)
    manager = Column(String)
    start_date = Column(String, nullable=False)
    username = Column(String, unique=True, index=True)
    temp_password = Column(String)
    corporate_email = Column(String, unique=True, index=True)
    status = Column(String, default="pending")  # pending | in_progress | completed | inactive
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
