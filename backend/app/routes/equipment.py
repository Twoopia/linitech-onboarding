from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentOut, EquipmentAssign
from ..services import equipment_service
from ..auth import require_rh

router = APIRouter()


@router.get("/", response_model=list[EquipmentOut])
def list_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return equipment_service.get_equipment_list(db, skip, limit)


@router.post("/", response_model=EquipmentOut, status_code=201)
def create_equipment(data: EquipmentCreate, db: Session = Depends(get_db), _=Depends(require_rh)):
    return equipment_service.create_equipment(db, data)


@router.get("/{equipment_id}", response_model=EquipmentOut)
def get_equipment(equipment_id: int, db: Session = Depends(get_db)):
    eq = equipment_service.get_equipment(db, equipment_id)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return eq


@router.put("/{equipment_id}", response_model=EquipmentOut)
def update_equipment(equipment_id: int, data: EquipmentUpdate, db: Session = Depends(get_db), _=Depends(require_rh)):
    eq = equipment_service.update_equipment(db, equipment_id, data)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return eq


@router.delete("/{equipment_id}", status_code=204)
def delete_equipment(equipment_id: int, db: Session = Depends(get_db), _=Depends(require_rh)):
    if not equipment_service.delete_equipment(db, equipment_id):
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")


@router.post("/{equipment_id}/assign", response_model=EquipmentOut)
def assign_equipment(equipment_id: int, data: EquipmentAssign, db: Session = Depends(get_db), _=Depends(require_rh)):
    eq = equipment_service.assign_equipment(db, equipment_id, data.employee_id)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return eq


@router.post("/{equipment_id}/return", response_model=EquipmentOut)
def return_equipment(equipment_id: int, db: Session = Depends(get_db), _=Depends(require_rh)):
    eq = equipment_service.return_equipment(db, equipment_id)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")
    return eq
