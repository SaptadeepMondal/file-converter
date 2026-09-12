import fitz  # PyMuPDF
from typing import BinaryIO
from ..base import BaseConverter
from ..image_processing.vlm import describe_image_bytes

class PDFConverter(BaseConverter):
    def convert(self, file_stream: BinaryIO, filename: str = "") -> str:
        file_bytes = file_stream.read()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        md_content = []
        md_content.append(f"# Document: {filename}\n")
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            md_content.append(f"## Page {page_num + 1}\n")
            
            elements = []
            
            # 1. Extract Tables
            tabs = page.find_tables()
            table_rects = []
            if tabs.tables:
                for tab in tabs.tables:
                    rect = fitz.Rect(tab.bbox)
                    table_rects.append(rect)
                    rows = tab.extract()
                    if not rows or not rows[0]: continue
                    
                    md_table = []
                    # Header
                    header = rows[0]
                    md_table.append("| " + " | ".join(str(c).replace("\n", " ").strip() if c else "" for c in header) + " |")
                    md_table.append("|" + "|".join(["---"] * len(header)) + "|")
                    # Body
                    for row in rows[1:]:
                        md_table.append("| " + " | ".join(str(c).replace("\n", " ").strip() if c else "" for c in row) + " |")
                        
                    elements.append({"type": "table", "y0": rect.y0, "content": "\n".join(md_table)})
            
            # 2. Extract Text Blocks
            blocks = page.get_text("blocks")
            for b in blocks:
                rect = fitz.Rect(b[:4])
                text = b[4].strip()
                if not text: continue
                
                # Deduplicate: Skip text blocks that are inside a table
                is_in_table = False
                for t_rect in table_rects:
                    if rect.intersects(t_rect):
                        intersect_area = rect.intersect(t_rect).get_area()
                        if intersect_area / (rect.get_area() + 1e-6) > 0.5:
                            is_in_table = True
                            break
                
                if not is_in_table:
                    elements.append({"type": "text", "y0": rect.y0, "content": text})
            
            # 3. Extract Images
            for img_info in page.get_image_info(xrefs=True):
                rect = fitz.Rect(img_info["bbox"])
                xref = img_info["xref"]
                if xref == 0: continue
                
                try:
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    ext = base_image["ext"]
                    description = describe_image_bytes(image_bytes, mime_type=f"image/{ext}")
                    elements.append({"type": "image", "y0": rect.y0, "content": description})
                except Exception as e:
                    print(f"Error extracting image on page {page_num}: {e}")
            
            # Sort elements by vertical position (top to bottom)
            elements.sort(key=lambda x: x["y0"])
            
            for el in elements:
                md_content.append(el["content"] + "\n")
                
        doc.close()
        return "\n".join(md_content)
