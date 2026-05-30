from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..database import Base


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False, index=True)
    entity_id = Column(Integer)
    details = Column(Text)
    user = Column(String, default="sistema")
    created_at = Column(DateTime, server_default=func.now())
