from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.features.router import FileTypeRouter
from starlette.responses import Response

import base64
import io
import httpx

from mcp.server.mcpserver import MCPServer

app = FastAPI()

# Allow CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MCP Server Setup
mcp_server = MCPServer("any2md")

@mcp_server.tool()
async def convert_file(
    filename: str, 
    content_base64: str = None, 
    url: str = None, 
    content_type: str = ""
) -> str:
    """
    Convert a file to Markdown. The file can be provided as base64 content or a URL.
    Provide either `content_base64` or `url`.
    """
    if not content_base64 and not url:
        raise ValueError("Either content_base64 or url must be provided")
        
    file_stream = None
    if content_base64:
        file_data = base64.b64decode(content_base64)
        file_stream = io.BytesIO(file_data)
    elif url:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            file_stream = io.BytesIO(response.content)
            
    try:
        return FileTypeRouter.convert_file(file_stream, filename, content_type)
    except Exception as e:
        raise ValueError(f"Error converting file: {str(e)}")

# Mount the MCP SSE app onto the FastAPI app
# It provides /api/mcp/sse and /api/mcp/messages
app.mount("/api/mcp", mcp_server.sse_app(sse_path="/sse", message_path="/messages"))

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "any2md-mcp"}

@app.post("/api/convert")
async def convert_file_http(file: UploadFile = File(...)):
    try:
        markdown_result = FileTypeRouter.convert_file(file.file, file.filename, file.content_type)
        return {"markdown": markdown_result, "filename": file.filename}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion error: {str(e)}")

