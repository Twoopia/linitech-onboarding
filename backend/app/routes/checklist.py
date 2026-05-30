from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.checklist import ChecklistItemOut, ChecklistItemUpdate
from ..services import checklist_service
from ..auth import require_rh

router = APIRouter()


@router.get("/{employee_id}", response_model=list[ChecklistItemOut])
def get_checklist(employee_id: int, db: Session = Depends(get_db)):
    return checklist_service.get_checklist(db, employee_id)


@router.get("/{employee_id}/progress")
def get_progress(employee_id: int, db: Session = Depends(get_db)):
    return checklist_service.get_progress(db, employee_id)


@router.put("/item/{item_id}", response_model=ChecklistItemOut)
def update_item(item_id: int, data: ChecklistItemUpdate, db: Session = Depends(get_db), _=Depends(require_rh)):
    item = checklist_service.update_item(db, item_id, data.completed)
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return item
