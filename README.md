# Any2MD - The Universal Markdown Converter

## Overview
Any2MD converts documents, spreadsheets, web content, and images into concise, token-efficient Markdown for humans and AI agents.

This project is a decoupled monorepo:
- **Frontend:** Next.js web showcase.
- **Backend:** FastAPI Python app that will expose MCP tools over SSE.

## Current Status
- Frontend is a Next.js starter template.
- Backend is a FastAPI skeleton with `/api/health` and `/api/mcp` placeholders.
- Conversion pipeline, VLM/OCR, and real MCP tools are planned and documented in `.docs/`.

## Project Structure
- `Frontend/`: Next.js App Router showcase.
- `Backend/`: FastAPI backend entry and dependencies.
- `.docs/`: Architecture, workflows, design rationale, and agent rules.

## Key Features / Roadmap
- Universal format support: PDF, DOCX, XLSX, CSV, HTML, images.
- VLM image transcription with OCR fallback.
- MCP native via SSE.
- Web interface with preview, copy, and download.

## Setup Instructions

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd Backend
pip install -r requirements.txt
copy Backend\.env.example Backend\.env  # add your API keys
uvicorn index:app --reload
```

## Usage
- **For humans:** Visit the web app to upload files and view Markdown output.
- **For AI agents:** Configure MCP client to point at the backend SSE endpoint once implemented.

## Notes
- See `.docs/` for architecture, workflows, and design decisions.
- Update `README.md` and `.docs/PROJECT_MAP.md` whenever the real implementation changes.
