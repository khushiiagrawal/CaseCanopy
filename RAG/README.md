# LangChain Flask Server

A simple Flask server that processes queries with LangChain and responds to GET requests from a frontend.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Running the server

```
python app.py
```

The server will run on http://localhost:8000

## API Endpoints

### GET /api/plain-text

Query the LangChain model with a GET request and store the query for later use.

**Parameters:**
- `query` (required): The text query to process

**Example:**
```
GET http://localhost:8000/api/plain-text?query=What is LangChain?
```

**Response:**
```json
{
  "response": "LangChain is a framework for developing applications powered by language models...",
  "saved_query": "What is LangChain?"
}
```

### GET /api/saved-query

Retrieve the most recently saved query.

**Example:**
```
GET http://localhost:8000/api/saved-query
```

**Response:**
```json
{
  "saved_query": "What is LangChain?"
}
``` 