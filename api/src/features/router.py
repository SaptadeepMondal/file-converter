from typing import BinaryIO
from .base import BaseConverter
from .document_parsing.pdf import PDFConverter
from .document_parsing.docx import DocxConverter
from .document_parsing.html import HtmlConverter
from .spreadsheet_parsing.excel import ExcelConverter

class FileTypeRouter:
    @staticmethod
    def get_converter(filename: str, content_type: str = "") -> BaseConverter:
        """
        Returns the appropriate converter based on filename extension or content type.
        """
        filename_lower = filename.lower()
        
        if filename_lower.endswith(".pdf") or "pdf" in content_type:
            return PDFConverter()
        elif filename_lower.endswith(".docx") or "word" in content_type:
            return DocxConverter()
        elif filename_lower.endswith((".xlsx", ".csv")) or "excel" in content_type or "csv" in content_type:
            return ExcelConverter()
        elif filename_lower.endswith((".html", ".htm")) or "html" in content_type:
            return HtmlConverter()
        else:
            raise ValueError(f"Unsupported file type: {filename}")

    @staticmethod
    def convert_file(file_stream: BinaryIO, filename: str, content_type: str = "") -> str:
        converter = FileTypeRouter.get_converter(filename, content_type)
        return converter.convert(file_stream, filename)
