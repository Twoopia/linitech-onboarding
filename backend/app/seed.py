from __future__ import annotations
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models.employee import Employee
from .models.equipment import Equipment
from .models.checklist import ChecklistItem
from .models.log import Log
from .services.checklist_service import DEFAULT_ITEMS


def _employee(name, email, dept, position, manager, start_date, username, corp_email, status, password="Demo@2026"):
    return Employee(
        name=name, email=email, department=dept, position=position,
        manager=manager, start_date=start_date, username=username,
        corporate_email=corp_email, temp_password=password, status=status,
    )


def run(db: Session) -> None:
    if db.query(Employee).count() > 0:
        return

    today = datetime.utcnow()

    # ── Employees ───────────────────────────────────────────────
    ana = _employee(
        "Ana Silva", "ana@gmail.com", "RH", "Analista de RH",
        "Diretora RH", "2026-05-01", "asilva", "ana.silva@linitech.com", "completed",
    )
    pedro = _employee(
        "Pedro Oliveira", "pedro@gmail.com", "TI", "Desenvolvedor Backend",
        "Tech Lead", "2026-05-15", "poliveira", "pedro.oliveira@linitech.com", "in_progress",
    )
    mariana = _employee(
        "Mariana Costa", "mariana@gmail.com", "Marketing", "Designer UI/UX",
        "Head de Marketing", "2026-06-02", "mcosta", "mariana.costa@linitech.com", "pending",
    )
    db.add_all([ana, pedro, mariana])
    db.commit()
    db.refresh(ana); db.refresh(pedro); db.refresh(mariana)

    # ── Checklists ──────────────────────────────────────────────
    for emp_id, n_done in [(ana.id, 12), (pedro.id, 7), (mariana.id, 0)]:
        for i, (title, desc, cat, resp) in enumerate(DEFAULT_ITEMS):
            item = ChecklistItem(
                employee_id=emp_id, title=title, description=desc,
                category=cat, responsible=resp, completed=i < n_done,
                completed_at=today - timedelta(days=12 - i) if i < n_done else None,
            )
            db.add(item)
    db.commit()

    # ── Equipment ───────────────────────────────────────────────
    eq1 = Equipment(type="Notebook", brand="Dell", model="XPS 15", serial_number="DL-001",
                    status="assigned", employee_id=ana.id, assigned_date=today - timedelta(days=30))
    eq2 = Equipment(type="Notebook", brand="Apple", model="MacBook Pro 14", serial_number="AP-002",
                    status="assigned", employee_id=pedro.id, assigned_date=today - timedelta(days=15))
    eq3 = Equipment(type="Monitor", brand="LG", model="UltraWide 34", serial_number="LG-003",
                    status="available")
    eq4 = Equipment(type="Headset", brand="Sony", model="WH-1000XM5", serial_number="SN-004",
                    status="available")
    eq5 = Equipment(type="Notebook", brand="Lenovo", model="ThinkPad X1", serial_number="LN-005",
                    status="available")
    db.add_all([eq1, eq2, eq3, eq4, eq5])
    db.commit()

    # ── Logs ────────────────────────────────────────────────────
    entries = [
        ("created", "employee", ana.id, "Colaborador Ana Silva provisionada: ana.silva@linitech.com", today - timedelta(days=30)),
        ("created", "employee", pedro.id, "Colaborador Pedro Oliveira provisionado: pedro.oliveira@linitech.com", today - timedelta(days=15)),
        ("created", "employee", mariana.id, "Colaborador Mariana Costa provisionada: mariana.costa@linitech.com", today - timedelta(days=1)),
        ("assigned", "equipment", eq1.id, "Notebook Dell XPS 15 atribuído à Ana Silva", today - timedelta(days=29)),
        ("assigned", "equipment", eq2.id, "MacBook Pro 14 atribuído ao Pedro Oliveira", today - timedelta(days=14)),
        ("completed", "employee", ana.id, "Onboarding de Ana Silva concluído automaticamente (checklist 100%)", today - timedelta(days=20)),
        ("updated", "employee", pedro.id, "Onboarding de Pedro Oliveira iniciado (primeiro item concluído)", today - timedelta(days=14)),
        ("credentials_generated", "employee", mariana.id, "Credenciais de Mariana Costa geradas", today - timedelta(hours=2)),
    ]
    for action, entity, entity_id, details, created_at in entries:
        db.add(Log(action=action, entity=entity, entity_id=entity_id, details=details, created_at=created_at))
    db.commit()
