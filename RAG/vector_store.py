from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_openai import OpenAIEmbeddings
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration from environment variables
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([QDRANT_URL, QDRANT_API_KEY, OPENAI_API_KEY]):
    raise ValueError("Required environment variables are not set")

# Initialize OpenAI embeddings with a model that produces 768-dimensional vectors
embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")

# Initialize Qdrant client
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)

# Initialize vector store
vectorstore = Qdrant(
    client=client,
    collection_name="my_documents",
    embeddings=embeddings,
)

def get_vectorstore():
    """Get the initialized vector store instance"""
    return vectorstore 