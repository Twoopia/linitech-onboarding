from __future__ import annotations
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.checklist import ChecklistItem
from ..models.employee import Employee
from .log_service import create_log

DEFAULT_ITEMS = [
    ("Configurar e-mail corporativo", "Configurar conta de e-mail no cliente de correio", "TI", "Suporte TI"),
    ("Cadastrar no sistema de RH", "Registrar dados pessoais e bancários no sistema de RH", "RH", "Analista RH"),
    ("Entregar equipamentos", "Notebook, monitor, headset e periféricos conforme cargo", "Facilities", "Facilities"),
    ("Configurar estação de trabalho", "Instalar softwares e configurar ambiente de desenvolvimento", "TI", "Suporte TI"),
    ("Emitir crachá de acesso", "Foto e cadastro biométrico na recepção", "Facilities", "Recepção"),
    ("Configurar VPN e acessos de sistema", "VPN corporativa e acesso aos sistemas internos", "TI", "Suporte TI"),
    ("Apresentar para a equipe", "Tour pelo escritório e apresentações formais", "Gestor", "Gestor direto"),
    ("Reunião de alinhamento com gestor", "Apresentar metas, expectativas e fluxo de trabalho", "Gestor", "Gestor direto"),
    ("Enviar documentos de admissão", "Contrato assinado, foto 3x4, documentos pessoais", "RH", "Analista RH"),
    ("Agendar treinamentos obrigatórios", "LGPD, compliance, segurança da informação", "RH", "Analista RH"),
    ("Cadastrar nos benefícios", "Plano de saúde, VT, VR e demais benefícios", "RH", "Analista RH"),
    ("Apresentar políticas da empresa", "Código de conduta, política de segurança e privacidade", "RH", "Analista RH"),
]


def create_default_checklist(db: Session, employee_id: int) -> None:
    for title, description, category, responsible in DEFAULT_ITEMS:
        item = ChecklistItem(
            employee_id=employee_id,
            title=title,
            description=description,
            category=category,
            responsible=responsible,
        )
        db.add(item)
    db.commit()


def get_checklist(db: Session, employee_id: int) -> list[ChecklistItem]:
    return db.query(ChecklistItem).filter(ChecklistItem.employee_id == employee_id).all()


def get_progress(db: Session, employee_id: int) -> dict:
    items = get_checklist(db, employee_id)
    total = len(items)
    done = sum(1 for i in items if i.completed)
    return {"total": total, "completed": done, "percentage": round(done / total * 100) if total else 0}


def _sync_employee_status(db: Session, employee_id: int, triggered_by_complete: bool) -> None:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee or employee.status == "inactive":
        return

    progress = get_progress(db, employee_id)

    if triggered_by_complete and progress["percentage"] == 100:
        if employee.status != "completed":
            employee.status = "completed"
            db.commit()
            create_log(
                db, "completed", "employee", employee_id,
                f"Onboarding de {employee.name} concluído automaticamente (checklist 100%)"
            )
    elif triggered_by_complete and progress["percentage"] > 0 and employee.status == "pending":
        employee.status = "in_progress"
        db.commit()
        create_log(
            db, "updated", "employee", employee_id,
            f"Onboarding de {employee.name} iniciado (primeiro item concluído)"
        )
    elif not triggered_by_complete and progress["percentage"] < 100:
        if employee.status == "completed":
            employee.status = "in_progress"
            db.commit()
            create_log(
                db, "updated", "employee", employee_id,
                f"Status de {employee.name} revertido para Em Andamento"
            )


def update_item(db: Session, item_id: int, completed: bool) -> ChecklistItem | None:
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        return None

    item.completed = completed
    item.completed_at = datetime.utcnow() if completed else None
    db.commit()
    db.refresh(item)

    action = "completed" if completed else "uncompleted"
    create_log(
        db, action, "checklist", item_id,
        f"Item '{item.title}' marcado como {'concluído' if completed else 'pendente'}"
    )

    _sync_employee_status(db, item.employee_id, triggered_by_complete=completed)

    return item
