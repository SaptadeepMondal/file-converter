from fastapi import APIRouter, UploadFile, File
from fastapi.responses import Response
from .services import DocumentService

router = APIRouter(prefix="/api/py/convert", tags=["conversion"])

@router.post("/md-to-pdf")
async def convert_md_to_pdf(file: UploadFile = File(...)):
    content = await file.read()
    pdf_io = DocumentService.md_to_pdf(content)
    return Response(content=pdf_io.read(), media_type="application/pdf")

@router.post("/md-to-docx")
async def convert_md_to_docx(file: UploadFile = File(...)):
    content = await file.read()
    doc_io = DocumentService.md_to_docx(content)
    return Response(
        content=doc_io.read(), 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@router.post("/docx-to-md")
async def convert_docx_to_md(file: UploadFile = File(...)):
    content = await file.read()
    md_text = DocumentService.docx_to_md(content)
    return Response(content=md_text.encode("utf-8"), media_type="text/markdown")

@router.post("/docx-to-pdf")
async def convert_docx_to_pdf(file: UploadFile = File(...)):
    content = await file.read()
    pdf_io = DocumentService.docx_to_pdf(content)
    return Response(content=pdf_io.read(), media_type="application/pdf")
