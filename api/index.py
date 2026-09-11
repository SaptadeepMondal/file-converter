from fastapi import FastAPI
from .router import router as conversion_router

app = FastAPI(
    title="ConvertioLite API",
    description="Python Backend for Document Conversions",
    docs_url="/api/py/docs", 
    openapi_url="/api/py/openapi.json"
)

app.include_router(conversion_router)
