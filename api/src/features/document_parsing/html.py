from bs4 import BeautifulSoup
from markdownify import markdownify as md
from typing import BinaryIO
from ..base import BaseConverter

class HtmlConverter(BaseConverter):
    def convert(self, file_stream: BinaryIO, filename: str = "") -> str:
        html_content = file_stream.read().decode('utf-8', errors='replace')
        
        # Parse and clean HTML using BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove noisy tags
        for tag in soup(["script", "style", "noscript", "meta", "link"]):
            tag.decompose()
            
        cleaned_html = str(soup)
        
        # Convert to Markdown
        # heading_style="ATX" ensures # H1 instead of underlining
        markdown_text = md(cleaned_html, heading_style="ATX").strip()
        
        return f"# Web Content: {filename}\n\n{markdown_text}\n"
