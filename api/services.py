import markdown
from xhtml2pdf import pisa
from io import BytesIO
import mammoth
from markdownify import markdownify as md
from htmldocx import HtmlToDocx
from docx import Document
from fastapi import HTTPException

class DocumentService:
    @staticmethod
    def generate_pdf(html_content: str) -> BytesIO:
        result_file = BytesIO()
        styled_html = f"""
        <html>
        <head>
        <style>
            body {{ font-family: Helvetica, Arial, sans-serif; font-size: 12pt; line-height: 1.6; padding: 20px; }}
            h1, h2, h3 {{ color: #333333; }}
            code {{ background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }}
            pre {{ background-color: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }}
        </style>
        </head>
        <body>{html_content}</body>
        </html>
        """
        pisa_status = pisa.CreatePDF(styled_html, dest=result_file)
        if pisa_status.err:
            raise HTTPException(status_code=500, detail="Error generating PDF")
        result_file.seek(0)
        return result_file

    @classmethod
    def md_to_pdf(cls, content: bytes) -> BytesIO:
        text = content.decode("utf-8")
        html = markdown.markdown(text, extensions=['fenced_code', 'tables'])
        return cls.generate_pdf(html)

    @staticmethod
    def md_to_docx(content: bytes) -> BytesIO:
        text = content.decode("utf-8")
        html = markdown.markdown(text, extensions=['fenced_code', 'tables'])
        
        new_doc = Document()
        parser = HtmlToDocx()
        parser.add_html_to_document(html, new_doc)
        
        doc_io = BytesIO()
        new_doc.save(doc_io)
        doc_io.seek(0)
        return doc_io

    @staticmethod
    def docx_to_md(content: bytes) -> str:
        docx_io = BytesIO(content)
        result = mammoth.convert_to_html(docx_io)
        html = result.value
        md_text = md(html, heading_style="ATX")
        return md_text

    @classmethod
    def docx_to_pdf(cls, content: bytes) -> BytesIO:
        docx_io = BytesIO(content)
        result = mammoth.convert_to_html(docx_io)
        html = result.value
        return cls.generate_pdf(html)
