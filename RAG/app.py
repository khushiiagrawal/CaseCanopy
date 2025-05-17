from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from typing import List, Dict
from vector_store import get_vectorstore
from collections import defaultdict

# Load environment variables
load_dotenv()

# Get configuration from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

if not all([OPENAI_API_KEY, MODEL_NAME, QDRANT_URL, QDRANT_API_KEY]):
    raise ValueError("Required environment variables are not set")

# Set API keys
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

app = Flask(__name__)
CORS(app)

# Initialize components
llm = ChatOpenAI(temperature=TEMPERATURE, model_name=MODEL_NAME)
vectorstore = get_vectorstore()

# Simple in-memory memory store
memory_store = defaultdict(list)

# Define the legal advisor prompt
legal_advisor_prompt = """You are an authoritative legal advisor with expertise in Indian Supreme Court jurisprudence. Your role is to provide definitive, precise guidance based on Supreme Court precedents.

Context information from relevant Supreme Court cases:
{context}

When responding to the following query, structure your answer as follows:

1. CASE PREDICTION: Provide a definitive assessment of how the Supreme Court would rule on this matter based on precedent. Be specific and confident in your prediction without hedging.

2. KEY SOURCES: Cite specific Supreme Court judgments from the context that support your analysis. For each source, include:
   - Case name and citation
   - Year of judgment
   - Relevant paragraph or section number
   - Clear explanation of how this precedent directly applies to the case

3. LEGAL REASONING: Present a conclusive analysis of the legal question using:
   - Definitive textual interpretation of relevant constitutional/statutory provisions
   - Direct application of precedents to the current case
   - Established policy considerations that influence the Court
   - Decisive refutation of potential counter-arguments

4. HISTORICAL CONTEXT: Present a clear evolution of the Supreme Court's approach to this legal question, highlighting definitive shifts in judicial philosophy rather than possibilities.

5. PRACTICAL IMPLICATIONS: Provide concrete next steps and clear guidance for the individual or entity seeking advice. Be specific about what actions should be taken.

Answer in the same language as the query. You have complete fluency in all Indian languages, including Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and others.

If certain information isn't available in the context, do not mention this limitation. Instead, focus exclusively on what can be definitively stated based on the available precedents, and provide clear guidance based on general principles of Indian law where specific precedents aren't available.

Memory from previous interactions:
{memory}

Query: {question}"""

# Create prompt template
prompt_template = ChatPromptTemplate.from_template(legal_advisor_prompt)

def format_docs(docs):
    """Format documents from retriever into a single string"""
    return "\n\n".join(doc.page_content for doc in docs)

def format_memory(memories):
    """Format memory into a single string"""
    if not memories:
        return "No relevant previous interactions."
    return "\n\n".join(memories)

def retrieve_context_and_memory(query_info):
    """Retrieve both documents and memory"""
    query = query_info["question"]
    user_id = query_info["user_id"]
    
    # Get relevant documents from retriever
    docs = vectorstore.similarity_search(query)
    
    # Get relevant memory
    memories = memory_store[user_id]
    
    return {
        "context": format_docs(docs),
        "memory": format_memory(memories),
        "question": query
    }

def save_interaction(user_id: str, user_input: str, assistant_response: str):
    """Save the interaction to memory"""
    interaction = f"User asked: {user_input}\nAssistant answered: {assistant_response}"
    memory_store[user_id].append(interaction)
    # Keep only last 10 interactions
    memory_store[user_id] = memory_store[user_id][-10:]

# Create the RAG chain
rag_chain = (
    retrieve_context_and_memory
    | prompt_template
    | llm
    | StrOutputParser()
)

# Global variable to store the latest query and user details
latest_query = ""
latest_user_details = {}

@app.route('/api/process-backend', methods=['GET'])
def process_backend_data():
    global latest_query, latest_user_details
    if not latest_query:
        return jsonify({"error": "No query has been saved yet", "status": "error"}), 404

    try:
        # Retrieve both the docs and the formatted context
        query_info = {
            "question": latest_query,
            "user_id": latest_user_details.get('id', 'default_user')
        }
        docs = vectorstore.similarity_search(query_info["question"])
        formatted_context = format_docs(docs)
        response = rag_chain.invoke(query_info)

        # Save the interaction
        save_interaction(
            latest_user_details.get('id', 'default_user'),
            latest_query,
            response
        )

        # Prepare retrieved chunks for frontend (raw text)
        retrieved_chunks = [doc.page_content for doc in docs]

        return jsonify({
            "status": "success",
            "saved_query": latest_query,
            "user_details": latest_user_details,
            "langchain_response": response,
            "retrieved_chunks": retrieved_chunks
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route('/api/feed-input', methods=['POST'])
def feed_input():
    global latest_query, latest_user_details
    
    data = request.get_json()
    if not data or 'input' not in data:
        return jsonify({"error": "No input provided in request body"}), 400
    
    latest_query = data['input']
    latest_user_details = data.get('userDetails', {})
    
    return jsonify({
        "message": "Input saved successfully",
        "saved_input": latest_query,
        "user_details": latest_user_details
    })

@app.route('/api/saved-query', methods=['GET'])
def get_saved_query():
    global latest_query
    if not latest_query:
        return jsonify({"error": "No query has been saved yet"}), 404
    
    try:
        response = rag_chain.invoke({
            "question": latest_query,
            "user_id": "default_user"
        })
        return jsonify({
            "saved_query": latest_query,
            "response": response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=9000)
    print(__doc__)