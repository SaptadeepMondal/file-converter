from abc import ABC, abstractmethod
from typing import BinaryIO

class BaseConverter(ABC):
    """
    Abstract base class for all file converters.
    All converters must implement the convert method which takes a file-like object
    and returns a Markdown string.
    """
    
    @abstractmethod
    def convert(self, file_stream: BinaryIO, filename: str = "") -> str:
        """
        Convert a file stream into a token-optimized Markdown string.
        
        Args:
            file_stream: A binary file stream (e.g., from fastapi UploadFile.file)
            filename: The original filename (useful for context or extension checks)
            
        Returns:
            A string containing the formatted Markdown.
        """
        pass
