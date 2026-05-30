from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.equipment import Equipment
from ..models.checklist import ChecklistItem
from ..schemas.equipment import EquipmentCreate, EquipmentUpdate
from .log_service import create_log

EQUIPMENT_CHECKLIST_TITLE = "Entregar equipamentos"


def _auto_complete_equipment_item(db: Session, employee_id: int) -> None:
    item = db.query(ChecklistItem).filter(
        ChecklistItem.employee_id == employee_id,
        ChecklistItem.title == EQUIPMENT_CHECKLIST_TITLE,
        ChecklistItem.completed.is_(False),
    ).first()
    if item:
        from .checklist_service import update_item
        update_item(db, item.id, True)


def create_equipment(db: Session, data: EquipmentCreate) -> Equipment:
    eq = Equipment(**data.model_dump())
    db.add(eq)
    db.commit()
    db.refresh(eq)
    create_log(db, "created", "equipment", eq.id, f"Equipamento {eq.type} ({eq.serial_number}) cadastrado")
    return eq


def get_equipment_list(db: Session, skip: int = 0, limit: int = 100) -> list[Equipment]:
    return db.query(Equipment).order_by(Equipment.created_at.desc()).offset(skip).limit(limit).all()


def get_equipment(db: Session, equipment_id: int) -> Equipment | None:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()


def update_equipment(db: Session, equipment_id: int, data: EquipmentUpdate) -> Equipment | None:
    eq = get_equipment(db, equipment_id)
    if not eq:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(eq, field, value)
    db.commit()
    db.refresh(eq)
    create_log(db, "updated", "equipment", equipment_id, f"Equipamento {eq.serial_number} atualizado")
    return eq


def delete_equipment(db: Session, equipment_id: int) -> bool:
    eq = get_equipment(db, equipment_id)
    if not eq:
        return False
    create_log(db, "deleted", "equipment", equipment_id, f"Equipamento {eq.serial_number} removido")
    db.delete(eq)
    db.commit()
    return True


def assign_equipment(db: Session, equipment_id: int, employee_id: int) -> Equipment | None:
    eq = get_equipment(db, equipment_id)
    if not eq:
        return None
    eq.employee_id = employee_id
    eq.status = "assigned"
    eq.assigned_date = datetime.utcnow()
    eq.returned_date = None
    db.commit()
    db.refresh(eq)
    create_log(db, "assigned", "equipment", equipment_id,
               f"Equipamento {eq.serial_number} atribuído ao colaborador {employee_id}")
    _auto_complete_equipment_item(db, employee_id)
    return eq


def return_equipment(db: Session, equipment_id: int) -> Equipment | None:
    eq = get_equipment(db, equipment_id)
    if not eq:
        return None
    eq.employee_id = None
    eq.status = "returned"
    eq.returned_date = datetime.utcnow()
    db.commit()
    db.refresh(eq)
    create_log(db, "returned", "equipment", equipment_id, f"Equipamento {eq.serial_number} devolvido")
    return eq
