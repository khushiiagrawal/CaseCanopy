from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from collections import defaultdict

# Load environment variables from .env if present
load_dotenv()

# Get configuration from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))

if not all([OPENAI_API_KEY, MODEL_NAME]):
    raise ValueError("Required environment variables are not set")

app = Flask(__name__)
CORS(app)

# Initialize LangChain components
llm = ChatOpenAI(
    temperature=TEMPERATURE,
    model_name=MODEL_NAME,
)

# Simple in-memory memory store
memory_store = defaultdict(list)

# Define the legal document analyzer prompt
legal_analyzer_prompt = """You are an expert legal document analyzer specializing in Indian law. Your role is to analyze legal documents and provide precise insights based on user queries.

Document content:
{document}

When responding to the following query, structure your answer as follows:

1. DOCUMENT ANALYSIS: Provide a definitive assessment of the document's content as it relates to the query.

2. KEY POINTS: Identify and explain the most relevant sections of the document that address the user's query.

3. LEGAL IMPLICATIONS: Present a clear analysis of the legal implications based on:
   - Specific provisions in the document
   - How these provisions apply to the scenario in question
   - Potential consequences or outcomes

4. RECOMMENDATIONS: Provide concrete advice based on the document analysis.

Memory from previous interactions:
{memory}

Query: {question}"""

# Create prompt template
prompt_template = ChatPromptTemplate.from_template(legal_analyzer_prompt)

def format_memory(memories):
    """Format memory into a single string"""
    if not memories:
        return "No relevant previous interactions."
    return "\n\n".join(memories)

def get_document_and_memory(query_info):
    """Retrieve document and memory"""
    query = query_info["question"]
    user_id = query_info["user_id"]
    
    # Get document content
    document = get_parsed_text()
    if not document:
        document = "No document available."
    
    # Get relevant memory
    memories = memory_store[user_id]
    
    return {
        "document": document,
        "memory": format_memory(memories),
        "question": query
    }

def save_interaction(user_id: str, user_input: str, assistant_response: str):
    """Save the interaction to memory"""
    interaction = f"User asked: {user_input}\nAssistant answered: {assistant_response}"
    memory_store[user_id].append(interaction)
    # Keep only last 10 interactions
    memory_store[user_id] = memory_store[user_id][-10:]

def get_parsed_text():
    try:
        response = requests.get('http://localhost:8000/api/plain-text')
        if response.status_code == 200:
            return response.text.strip()
        else:
            return None
    except Exception as e:
        return None

# Create the chain
analyzer_chain = (
    get_document_and_memory
    | prompt_template
    | llm
    | StrOutputParser()
)

# Global variables to store the latest query and user details
latest_query = ""
latest_user_details = {}

@app.route('/api/analyze', methods=['POST'])
def analyze():
    global latest_query, latest_user_details
    
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided in request body"}), 400
    
    latest_query = data['query']
    latest_user_details = data.get('userDetails', {'id': 'default_user'})
    
    try:
        query_info = {
            "question": latest_query,
            "user_id": latest_user_details.get('id', 'default_user')
        }
        
        document = get_parsed_text()
        if not document:
            return jsonify({"error": "No parsed document available"}), 404
        
        response = analyzer_chain.invoke(query_info)
        
        # Save the interaction
        save_interaction(
            latest_user_details.get('id', 'default_user'),
            latest_query,
            response
        )
        
        return jsonify({
            "status": "success",
            "query": latest_query,
            "document_available": True,
            "langchain_response": response
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/analyze', methods=['GET'])
def get_latest_analysis():
    global latest_query, latest_user_details
    
    if not latest_query:
        # If no query has been made yet, create a default summary request
        query_info = {
            "question": "Summarize this document",
            "user_id": "default_user"
        }
    else:
        query_info = {
            "question": latest_query,
            "user_id": latest_user_details.get('id', 'default_user')
        }
    
    document = get_parsed_text()
    if not document:
        return jsonify({"error": "No parsed document available"}), 404
    
    try:
        response = analyzer_chain.invoke(query_info)
        
        return jsonify({
            "status": "success",
            "query": query_info["question"],
            "document_available": True,
            "langchain_response": response
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

if __name__ == '__main__':
    app.run(port=9001, debug=True) 