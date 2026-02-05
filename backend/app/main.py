from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.v1.api import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Casino Platform Backend",
        version="1.0.0",
    )

    # ───────── CORS ─────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],   # dev only
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ───────── Static uploads ─────────
    if not os.path.exists("uploads"):
        os.makedirs("uploads")

    app.mount("/static", StaticFiles(directory="."), name="static")

    # ───────── Routers ─────────
    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()
