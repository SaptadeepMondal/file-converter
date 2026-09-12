from docx import Document
from docx.document import Document as _Document
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl
from docx.table import _Cell, Table
from docx.text.paragraph import Paragraph
from typing import BinaryIO
from ..base import BaseConverter
from ..image_processing.vlm import describe_image_bytes

def iter_block_items(parent):
    if isinstance(parent, _Document):
        parent_elm = parent.element.body
    elif isinstance(parent, _Cell):
        parent_elm = parent._tc
    else:
        raise ValueError("Unsupported parent type for iter_block_items")

    for child in parent_elm.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)

class DocxConverter(BaseConverter):
    def convert(self, file_stream: BinaryIO, filename: str = "") -> str:
        doc = Document(file_stream)
        md_content = []
        md_content.append(f"# Document: {filename}\n")
        
        # 1. Process Text and Tables in order
        for block in iter_block_items(doc):
            if isinstance(block, Paragraph):
                text = block.text.strip()
                if not text:
                    continue
                    
                if block.style.name.startswith('Heading'):
                    level = block.style.name.replace('Heading', '').strip()
                    try:
                        level_int = int(level)
                        md_content.append(f"{'#' * level_int} {text}\n")
                    except ValueError:
                        md_content.append(f"# {text}\n")
                else:
                    md_content.append(text + "\n")
                    
            elif isinstance(block, Table):
                if not block.rows:
                    continue
                    
                md_table = []
                # Header
                header_cells = [cell.text.replace("\n", " ").strip() for cell in block.rows[0].cells]
                md_table.append("| " + " | ".join(header_cells) + " |")
                md_table.append("|" + "|".join(["---"] * len(header_cells)) + "|")
                
                # Body
                for row in block.rows[1:]:
                    row_cells = [cell.text.replace("\n", " ").strip() for cell in row.cells]
                    md_table.append("| " + " | ".join(row_cells) + " |")
                    
                md_content.append("\n".join(md_table) + "\n")
                
        # 2. Process Images (appended at end since python-docx doesn't easily map images to paragraph locations)
        for rel in doc.part.rels.values():
            if "image" in rel.target_ref:
                try:
                    image_bytes = rel.target_part.blob
                    ext = rel.target_ref.split('.')[-1].lower()
                    mime_type = f"image/{ext}" if ext != 'jpg' else 'image/jpeg'
                    description = describe_image_bytes(image_bytes, mime_type=mime_type)
                    md_content.append(description + "\n")
                except Exception as e:
                    print(f"Error extracting DOCX image: {e}")
                    
        return "\n".join(md_content)
