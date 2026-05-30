from __future__ import annotations
from sqlalchemy.orm import Session
from ..models.log import Log


def create_log(db: Session, action: str, entity: str, entity_id: int, details: str = "", user: str = "sistema") -> Log:
    entry = Log(action=action, entity=entity, entity_id=entity_id, details=details, user=user)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_logs(db: Session, entity: str | None = None, limit: int = 100) -> list[Log]:
    q = db.query(Log)
    if entity:
        q = q.filter(Log.entity == entity)
    return q.order_by(Log.id.desc()).limit(limit).all()
