import pandas as pd
from typing import BinaryIO
from ..base import BaseConverter

class ExcelConverter(BaseConverter):
    def convert(self, file_stream: BinaryIO, filename: str = "") -> str:
        md_content = []
        md_content.append(f"# Spreadsheet: {filename}\n")
        
        try:
            # We use sheet_name=None to read all sheets into a dict of DataFrames
            sheets = pd.read_excel(file_stream, sheet_name=None)
            
            for sheet_name, df in sheets.items():
                md_content.append(f"## Sheet: {sheet_name}\n")
                # Drop entirely empty rows and columns to save tokens
                df.dropna(how='all', inplace=True)
                df.dropna(how='all', axis=1, inplace=True)
                
                # Convert DataFrame to Markdown table
                md_table = df.to_markdown(index=False)
                if md_table:
                    md_content.append(md_table + "\n")
                else:
                    md_content.append("> [Empty Sheet]\n")
                    
        except Exception as e:
            md_content.append(f"> [Error parsing spreadsheet: {e}]\n")
            
        return "\n".join(md_content)
