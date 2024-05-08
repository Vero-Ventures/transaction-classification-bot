import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from llm.loader import model_lifespan
import os
from dotenv import load_dotenv
from api.main import api_router


app = FastAPI(lifespan=model_lifespan)

load_dotenv()
DEV_MODE = os.getenv("DEV_MODE") == "True"
ALLOWED_ORIGINS = json.loads(os.getenv("ALLOWED_ORIGINS"))

if DEV_MODE:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app="main:app",
        host=os.getenv("SERVER_HOST"),
        port=int(os.getenv("SERVER_PORT")),
        reload=bool(os.getenv("DEBUG")),
        workers=int(os.getenv("WORKERS")),
    )
