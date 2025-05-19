# Legal Document Generator - AI Agent

This FastAPI server provides endpoints to generate legal documents (PIL, RTI, and Complaints) using OpenAI's GPT-4o-mini model.

## Prerequisites

- Python 3.11
- OpenAI API key

## Setup

1. Create a Python virtual environment:

   For macOS/Linux:
   ```bash
   python3.11 -m venv venv
   ```

   For Windows:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:

   For macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

   For Windows:
   ```bash
   .\venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   pip install langdetect
   ```

4. Set up your environment variables:
   Create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your_api_key_here
   BACKEND_URL=http://localhost:3000
   ```
   Replace `your_api_key_here` with your actual OpenAI API key.

## Running the Server

Start the FastAPI server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

The server will be available at `http://localhost:8001`


## Document Types

The system can generate three types of legal documents:

1. PIL (Public Interest Litigation)
   - For environmental issues, public welfare, or constitutional rights violations
   - Requires broader public interest implications

2. RTI (Right to Information)
   - For requesting information from government bodies
   - Based on Right to Information Act, 2005

3. Complaint
   - For filing formal grievances with authorities
   - Handles individual consumer grievances

## Response Format

The generated documents are returned as PDF files with appropriate formatting and legal terminology. 