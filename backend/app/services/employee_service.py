from __future__ import annotations
import re
import secrets
import string
from sqlalchemy.orm import Session
from ..models.employee import Employee
from ..schemas.employee import EmployeeCreate, EmployeeUpdate
from .log_service import create_log
from .checklist_service import create_default_checklist


def _slugify(text: str) -> str:
    text = text.lower()
    # Normalize common accented chars
    replacements = {"ã": "a", "â": "a", "á": "a", "à": "a", "ç": "c", "é": "e", "ê": "e",
                    "í": "i", "ó": "o", "ô": "o", "õ": "o", "ú": "u", "ü": "u"}
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return re.sub(r"[^a-z0-9]", "", text)


def _generate_username(name: str, db: Session) -> str:
    parts = name.strip().split()
    first = _slugify(parts[0]) if parts else "user"
    last = _slugify(parts[-1]) if len(parts) > 1 else ""
    base = (first[0] + last) if last else first
    base = base[:20]

    username = base
    counter = 1
    while db.query(Employee).filter(Employee.username == username).first():
        username = f"{base}{counter}"
        counter += 1
    return username


def _generate_password() -> str:
    chars = string.ascii_letters + string.digits + "!@#$%&"
    return "".join(secrets.choice(chars) for _ in range(14))


COMPANY_DOMAIN = "linitech.com"


def _generate_corporate_email(name: str, db: Session) -> str:
    parts = name.strip().split()
    first = _slugify(parts[0]) if parts else "usuario"
    last = _slugify(parts[-1]) if len(parts) > 1 else ""
    base = f"{first}.{last}" if last else first

    email = f"{base}@{COMPANY_DOMAIN}"
    counter = 1
    while db.query(Employee).filter(Employee.corporate_email == email).first():
        # Append counter to base (before @), not between first and last
        email = f"{base}{counter}@{COMPANY_DOMAIN}"
        counter += 1
    return email


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    username = _generate_username(data.name, db)
    password = _generate_password()
    corporate_email = _generate_corporate_email(data.name, db)

    employee = Employee(
        **data.model_dump(),
        username=username,
        temp_password=password,
        corporate_email=corporate_email,
        status="pending",
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    create_default_checklist(db, employee.id)
    create_log(
        db, "created", "employee", employee.id,
        f"Colaborador {employee.name} provisionado: {corporate_email} | login: {username}"
    )
    return employee


def get_employees(db: Session, skip: int = 0, limit: int = 100) -> list[Employee]:
    return db.query(Employee).order_by(Employee.created_at.desc()).offset(skip).limit(limit).all()


def get_employee(db: Session, employee_id: int) -> Employee | None:
    return db.query(Employee).filter(Employee.id == employee_id).first()


def update_employee(db: Session, employee_id: int, data: EmployeeUpdate) -> Employee | None:
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    create_log(db, "updated", "employee", employee_id, f"Dados de {employee.name} atualizados")
    return employee


def delete_employee(db: Session, employee_id: int) -> bool:
    employee = get_employee(db, employee_id)
    if not employee:
        return False
    create_log(db, "deleted", "employee", employee_id, f"Colaborador {employee.name} removido")
    db.delete(employee)
    db.commit()
    return True


def regenerate_credentials(db: Session, employee_id: int) -> Employee | None:
    employee = get_employee(db, employee_id)
    if not employee:
        return None
    employee.temp_password = _generate_password()
    db.commit()
    db.refresh(employee)
    create_log(db, "credentials_generated", "employee", employee_id, f"Credenciais de {employee.name} regeneradas")
    return employee
