# CaseCanopy

## Overview
CaseCanopy is an AI-powered legal platform that bridges the justice gap by enabling cross-jurisdiction legal precedent discovery and outcome prediction. It provides equal access to legal insights through a modern, responsive web application.

## Project Structure
- **agentic-ai/**: Python FastAPI service for legal document generation using AI.
- **backend/**: Go (Gin) backend for user, admin, file, and document management.
- **frontend/**: Next.js/React frontend for user interaction and legal research.
- **RAG/**: Python Flask server for retrieval-augmented generation (LangChain-based).

## Key Features
- **AI-powered legal document generation** (petitions, RTIs, complaints, etc.)
- **Case law and legal precedent search**
- **Outcome prediction and legal insights**
- **User authentication and admin approval**
- **Document upload, management, and PDF generation**
- **Modern, responsive frontend UI**



## Setup Instructions

#### 1. Clone the repository:
```bash
git clone https://github.com/Arpit529Srivastava/Case_Canopy.git
cd Case_Canopy
```

### 2. Set up the AI Agent:
```bash
cd ai_agent
   # Follow instructions in ai_agent/README.md
```


### 3. Set up the Backend:
```bash
cd backend
go mod tidy
go run main.go
# Server runs on :8000, requires MongoDB running locally
```

### 4. Set up the Frontend:
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### 5. Set up the RAG:
```bash
cd RAG
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
# Server runs on http://localhost:8000

# in other terminal tab run:
source venv/bin/activate
pip install -r requirements.txt
python analyzer.py
```

## Environment Variables

### 1. agentic-ai/.env
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. RAG/.env
```
OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o-mini 
QDRANT_URL=your_link
QDRANT_API_KEY=your_qdrant_api_key_here
```

### 3. backend/.env
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=generate_password_and paste_here
JWT_SECRET=your_token
GEMINI_API_KEY=your_api_key
```

### 4. frontend/.env.local
```
MONGODB_URI=you_uri
JWT_SECRET=secret_token
```

## License
- This project is licensed under the MIT License.