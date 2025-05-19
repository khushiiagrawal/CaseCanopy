from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import httpx
from legal_agent import LegalDocumentAgent

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

legal_agent = LegalDocumentAgent()

class DocumentRequest(BaseModel):
    user_input: str
    user_name: str
    location: str
    contact_number: str = Field(description="Contact number of the applicant")

@app.post("/generate_document")
async def generate_document(request: DocumentRequest):
    try:
        # Generate the document using the agent
        pdf_path = legal_agent.generate_document(
            user_input=request.user_input,
            user_name=request.user_name,
            location=request.location,
            contact_number=request.contact_number
        )
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Document generation failed")

        # Return PDF file as response
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=os.path.basename(pdf_path)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate_from_backend")
async def generate_from_backend(
    test: bool = False,
    api_url: str = "http://localhost:9000/api/process-backend",
    method: str = "get"
):
    try:
        # Use mock data for testing if requested
        if test:
            print("Using mock data for testing")
            data = {
                "langchain_response": "This is a test document for legal petition generation.",
                "user_details": {
                    "name": "Test User",
                    "address": "Test Address, City",
                    "phone": "1234567890"
                }
            }
        else:
            # Fetch data from the backend API
            try:
                method = method.lower()
                print(f"Attempting to connect to {api_url} using {method.upper()} method")
                
                async with httpx.AsyncClient() as client:
                    if method == "post":
                        response = await client.post(api_url, timeout=30.0)
                    else:  # default to GET
                        response = await client.get(api_url, timeout=30.0)
                    
                    # Print response status for debugging
                    print(f"API Response status: {response.status_code}")
                    response.raise_for_status()
                    
            except httpx.RequestError as e:
                # Handle network/connection errors
                print(f"Error connecting to backend API: {str(e)}")
                raise HTTPException(status_code=503, detail=f"Backend API connection error: {str(e)}")
            except httpx.HTTPStatusError as e:
                # Handle HTTP errors (non-200 responses)
                print(f"Backend API returned error status: {e.response.status_code}")
                print(f"Response content: {e.response.text}")
                raise HTTPException(
                    status_code=502, 
                    detail=f"Backend API returned status {e.response.status_code}: {e.response.text}"
                )
            
            # Extract data from the backend response
            try:
                data = response.json()
                print(f"Backend API response: {data}")
            except ValueError:
                print(f"Invalid JSON response: {response.text}")
                raise HTTPException(status_code=500, detail="Backend API returned invalid JSON")
        
        # Map the fields according to requirements
        user_input = data.get("langchain_response", "")
        user_details = data.get("user_details", {})
        user_name = user_details.get("name", "")
        location = user_details.get("address", "")
        contact_number = user_details.get("phone", "")
        
        # Check if required fields are present
        if not user_input:
            raise HTTPException(status_code=422, detail="Missing langchain_response in backend data")
        
        # Generate document using the extracted data
        pdf_path = legal_agent.generate_document(
            user_input=user_input,
            user_name=user_name,
            location=location,
            contact_number=contact_number
        )
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Document generation failed")
            
        # Return PDF file as response
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=os.path.basename(pdf_path)
        )
        
    except Exception as e:
        import traceback
        print(f"Error in generate_from_backend: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Add this at the end of the file to run the app on port 8001
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
