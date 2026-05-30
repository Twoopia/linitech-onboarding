from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.employee import Employee
from ..models.equipment import Equipment
from ..models.checklist import ChecklistItem
from ..models.log import Log

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    pending = db.query(func.count(Employee.id)).filter(Employee.status == "pending").scalar() or 0
    in_progress = db.query(func.count(Employee.id)).filter(Employee.status == "in_progress").scalar() or 0
    completed = db.query(func.count(Employee.id)).filter(Employee.status == "completed").scalar() or 0
    inactive = db.query(func.count(Employee.id)).filter(Employee.status == "inactive").scalar() or 0

    total_equipment = db.query(func.count(Equipment.id)).scalar() or 0
    assigned_equipment = db.query(func.count(Equipment.id)).filter(Equipment.status == "assigned").scalar() or 0
    available_equipment = db.query(func.count(Equipment.id)).filter(Equipment.status == "available").scalar() or 0

    total_items = db.query(func.count(ChecklistItem.id)).scalar() or 0
    completed_items = db.query(func.count(ChecklistItem.id)).filter(ChecklistItem.completed.is_(True)).scalar() or 0

    return {
        "employees": {
            "total": total_employees,
            "pending": pending,
            "in_progress": in_progress,
            "completed": completed,
            "inactive": inactive,
        },
        "equipment": {
            "total": total_equipment,
            "assigned": assigned_equipment,
            "available": available_equipment,
        },
        "checklist": {
            "total": total_items,
            "completed": completed_items,
            "percentage": round(completed_items / total_items * 100) if total_items else 0,
        },
    }


@router.get("/recent")
def get_recent(limit: int = 15, db: Session = Depends(get_db)):
    logs = db.query(Log).order_by(Log.id.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "details": log.details,
            "user": log.user,
            "created_at": log.created_at,
        }
        for log in logs
    ]
