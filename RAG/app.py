from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Load environment variables
load_dotenv()

# Get configuration from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")
if not MODEL_NAME:
    raise ValueError("MODEL_NAME environment variable is not set")

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

app = Flask(__name__)
CORS(app)

# Initialize LangChain components
llm = ChatOpenAI(temperature=TEMPERATURE, model_name=MODEL_NAME)
prompt_template = PromptTemplate(
    input_variables=["user_input"],
    template="You are a helpful assistant. User query: {user_input}\nPlease respond with a helpful answer."
)

# Create the chain
chain = prompt_template | llm | StrOutputParser()

# Global variable to store the latest query for reuse
latest_query = ""

def fetch_from_backend():
    try:
        response = requests.get('http://localhost:8000/api/plain-text')
        print("Backend status code:", response.status_code)
        print("Backend response text:", response.text)
        if response.status_code == 200:
            # Wrap plain text in a JSON-like dict
            return {"input": response.text.strip()}
        else:
            return None
    except Exception as e:
        print(f"Error fetching from backend: {str(e)}")
        return None

@app.route('/api/process-backend', methods=['GET'])
def process_backend_data():
    # Fetch data from backend
    backend_data = fetch_from_backend()
    if not backend_data:
        return jsonify({"error": "Failed to fetch data from backend"}), 500

    # Get the input from backend response
    query = backend_data.get('input', '')
    if not query:
        return jsonify({"error": "No input found in backend response"}), 400

    # Process through LangChain
    try:
        response = chain.invoke({"user_input": query})
        return jsonify({
            "original_input": query,
            "langchain_response": response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/feed-input', methods=['POST'])
def feed_input():
    global latest_query
    
    # Get the input from the request body
    data = request.get_json()
    if not data or 'input' not in data:
        return jsonify({"error": "No input provided in request body"}), 400
    
    # Save the input in the global variable
    latest_query = data['input']
    
    # Process the input with LangChain
    try:
        response = chain.invoke({"user_input": latest_query})
        return jsonify({
            "message": "Input saved successfully",
            "response": response,
            "saved_input": latest_query
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/saved-query', methods=['GET'])
def get_saved_query():
    global latest_query
    if not latest_query:
        return jsonify({"error": "No query has been saved yet"}), 404
    return jsonify({
        "saved_query": latest_query,
        "response": chain.invoke({"user_input": latest_query})
    })

# Test the chain on startup
def test_chain():
    try:
        test_input = "What is the capital of France?"
        response = chain.invoke({"user_input": test_input})
        print("LangChain test successful!")
        print(f"Test input: {test_input}")
        print(f"Test response: {response}")
    except Exception as e:
        print(f"LangChain test failed: {str(e)}")

if __name__ == '__main__':
    test_chain()  # Run the test before starting the server
    app.run(debug=True, port=9000) 