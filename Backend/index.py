from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.features.router import FileTypeRouter

app = FastAPI()

# Allow CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "any2md-mcp"}

@app.get("/api/mcp")
def mcp_sse_endpoint():
    return {"message": "MCP SSE Endpoint Placeholder"}

@app.post("/api/convert")
async def convert_file(file: UploadFile = File(...)):
    try:
        # FastAPI UploadFile.file is a SpooledTemporaryFile which is binary
        markdown_result = FileTypeRouter.convert_file(file.file, file.filename, file.content_type)
        return {"markdown": markdown_result, "filename": file.filename}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")
