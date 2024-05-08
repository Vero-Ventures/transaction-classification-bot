from fastapi import APIRouter

from .routes import home, keytest, generate

api_router = APIRouter()
api_router.include_router(home.router, tags=["home"])
api_router.include_router(keytest.router, tags=["keytest"])
api_router.include_router(generate.router, tags=["generate"])
