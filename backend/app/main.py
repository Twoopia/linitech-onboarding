import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .models import Employee, ChecklistItem, Equipment, Log  # noqa: F401
from .auth import verify_token
from .routes import employees, checklist, equipment, dashboard, logs
from .routes import auth as auth_routes

Base.metadata.create_all(bind=engine)

from .database import SessionLocal
from . import seed as _seed
_db = SessionLocal()
try:
    _seed.run(_db)
finally:
    _db.close()

app = FastAPI(
    title="Linitech Onboarding API",
    description="Sistema de automação de onboarding — Linitech",
    version="1.0.0",
)

_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
_allowed_origins = ["*"] if _raw_origins == "*" else [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

# Public
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth"])

# Protected — every route below requires a valid Bearer token
_protected = {"dependencies": [Depends(verify_token)]}
app.include_router(employees.router, prefix="/api/employees", tags=["Colaboradores"], **_protected)
app.include_router(checklist.router, prefix="/api/checklist", tags=["Checklist"], **_protected)
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipamentos"], **_protected)
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"], **_protected)
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"], **_protected)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Linitech Onboarding operacional"}
