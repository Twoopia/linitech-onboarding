from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeOut
from ..services import employee_service
from ..auth import require_rh

router = APIRouter()


@router.get("/", response_model=list[EmployeeOut])
def list_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    limit = min(limit, 200)
    return employee_service.get_employees(db, skip, limit)


@router.post("/", response_model=EmployeeOut, status_code=201)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db), _=Depends(require_rh)):
    return employee_service.create_employee(db, data)


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = employee_service.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return employee


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, data: EmployeeUpdate, db: Session = Depends(get_db), _=Depends(require_rh)):
    employee = employee_service.update_employee(db, employee_id, data)
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return employee


@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db), _=Depends(require_rh)):
    if not employee_service.delete_employee(db, employee_id):
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")


@router.post("/{employee_id}/regenerate-credentials", response_model=EmployeeOut)
def regenerate_credentials(employee_id: int, db: Session = Depends(get_db), _=Depends(require_rh)):
    employee = employee_service.regenerate_credentials(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return employee
