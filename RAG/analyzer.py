from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

# Load environment variables from .env if present
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))

app = Flask(__name__)

# Initialize LangChain components
llm = ChatOpenAI(
    temperature=TEMPERATURE,
    model_name=MODEL_NAME,
    openai_api_key=OPENAI_API_KEY
)
prompt_template = PromptTemplate(
    input_variables=["document", "user_query"],
    template="You are a helpful assistant. Here is a legal document:\n{document}\n\nUser query: {user_query}\nPlease respond with a helpful answer based on the document."
)
chain = prompt_template | llm | StrOutputParser()

# Global variables to store the latest query and response
latest_query = None
latest_response = None

def get_parsed_text():
    try:
        # Get the text content
        text_response = requests.get('http://localhost:8000/api/plain-text')
        if text_response.status_code != 200:
            return None, {}

        # Get the latest document which includes user details
        doc_response = requests.get('http://localhost:8000/api/latest-document')
        if doc_response.status_code != 200:
            return text_response.text.strip(), {}

        # Extract user details from the document response
        doc_data = doc_response.json()
        user_details = doc_data.get('user_details', {})
        
        return text_response.text.strip(), user_details
    except Exception as e:
        print(f"Error in get_parsed_text: {str(e)}")
        return None, {}

@app.route('/analyze', methods=['POST'])
def analyze():
    global latest_query, latest_response
    data = request.get_json()
    user_query = data.get('query', '')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    parsed_text, user_details = get_parsed_text()
    if not parsed_text:
        return jsonify({"error": "No parsed document available"}), 404

    try:
        response = chain.invoke({"document": parsed_text, "user_query": user_query})
        latest_query = user_query
        latest_response = response
        return jsonify({
            "status": "success",
            "query": user_query,
            "langchain_response": response,
            "user_details": user_details
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['GET'])
def get_latest_analysis():
    parsed_text, user_details = get_parsed_text()
    if not parsed_text:
        return jsonify({"error": "No parsed document available"}), 404
    try:
        # Wrap the parsed text in a JSON structure
        document_json = {"document": parsed_text}
        # You can modify this structure as needed
        response = chain.invoke({"document": parsed_text, "user_query": "Summarize the document"})
        return jsonify({
            "status": "success",
            "document": document_json,
            "langchain_response": response,
            "user_details": user_details
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=9001, debug=True) 