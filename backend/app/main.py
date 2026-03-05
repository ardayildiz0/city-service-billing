from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import engine, Base
from app.cron.jobs import run_daily_usage, run_monthly_invoices
from app.routers import auth, users, cities, taxes, currencies, providers, services, provider_services, subscriptions, reports

# Import all models so they are registered with Base.metadata
import app.models  # noqa: F401

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    scheduler.add_job(run_daily_usage, "cron", hour=1, minute=0)
    scheduler.add_job(run_monthly_invoices, "cron", day=1, hour=2, minute=0)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="City Service Subscription System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cities.router)
app.include_router(taxes.router)
app.include_router(currencies.router)
app.include_router(providers.router)
app.include_router(services.router)
app.include_router(provider_services.router)
app.include_router(subscriptions.router)
app.include_router(reports.router)
