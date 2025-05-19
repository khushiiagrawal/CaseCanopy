from langchain.agents import Tool, AgentExecutor, LLMSingleActionAgent
from langchain.prompts import StringPromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import AgentAction, AgentFinish, HumanMessage
from langchain.chains import LLMChain
from langchain.agents.output_parsers import ReActSingleInputOutputParser
from typing import List, Union, Tuple, Dict, Any
import re
import os
from dotenv import load_dotenv
from legal_tools import PILTool, RTITool, ComplaintTool, LegalDocumentInput
from langdetect import detect

# Load environment variables
load_dotenv()

class CustomOutputParser(ReActSingleInputOutputParser):
    def parse(self, text: str) -> Union[AgentAction, AgentFinish]:
        # Try to extract thought and action using regex
        thought_match = re.search(r"Thought:\s*(.*?)(?=Action:|$)", text, re.DOTALL)
        action_match = re.search(r"Action:\s*(.*?)(?=Action Input:|$)", text, re.DOTALL)
        action_input_match = re.search(r"Action Input:\s*(.*?)$", text, re.DOTALL)
        
        if not thought_match or not action_match:
            # If parsing fails, try to determine the action based on the input
            if "information" in text.lower() or "records" in text.lower():
                return AgentAction(tool="RTI", tool_input=text, log=text)
            elif "environment" in text.lower() or "pollution" in text.lower():
                return AgentAction(tool="PIL", tool_input=text, log=text)
            else:
                return AgentAction(tool="Complaint", tool_input=text, log=text)
        
        thought = thought_match.group(1).strip()
        action = action_match.group(1).strip()
        action_input = action_input_match.group(1).strip() if action_input_match else text
        
        return AgentAction(tool=action, tool_input=action_input, log=text)

class LegalDocumentPromptTemplate(StringPromptTemplate):
    template = """You are a legal document generation assistant. Your task is to determine the most appropriate type of legal document to generate based on the user's input.

Available document types:
1. PIL (Public Interest Litigation) - For environmental issues, public welfare, or constitutional rights violations
2. RTI (Right to Information) - For requesting information from government bodies
3. Complaint - For filing formal grievances with authorities

User Input:
{input}

Think about which type of document would be most appropriate for this case. Consider:
- The nature of the issue
- The desired outcome
- The appropriate authority to address
- The legal framework involved

You MUST respond in the following format:
Thought: [your reasoning about which document type is most appropriate]
Action: [the document type you've chosen - either PIL, RTI, or Complaint]
Action Input: [the original user input]

Remember to always include both "Thought:" and "Action:" in your response."""
    input_variables: List[str] = ["input"]

    def format(self, **kwargs) -> str:
        return self.template.format(**kwargs)

class LegalDocumentAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.3,
            model="gpt-4o-mini",
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Initialize tools
        self.tools = [
            Tool(
                name="PIL",
                func=lambda x: PILTool()._run(
                    user_issue=x.split("User Issue: ")[1].split("\nLegal Insights:")[0],
                    insights=x.split("Legal Insights: ")[1].split("\nUser Name:")[0],
                    user_name=x.split("User Name: ")[1].split("\nLocation:")[0],
                    location=x.split("Location: ")[1].split("\nContact:")[0],
                    contact_number=x.split("Contact: ")[1] if "Contact: " in x else None
                ),
                description="Generate a Public Interest Litigation (PIL) document"
            ),
            Tool(
                name="RTI",
                func=lambda x: RTITool()._run(
                    user_issue=x.split("User Issue: ")[1].split("\nLegal Insights:")[0],
                    insights=x.split("Legal Insights: ")[1].split("\nUser Name:")[0],
                    user_name=x.split("User Name: ")[1].split("\nLocation:")[0],
                    location=x.split("Location: ")[1].split("\nContact:")[0],
                    contact_number=x.split("Contact: ")[1] if "Contact: " in x else None
                ),
                description="Generate a Right to Information (RTI) application"
            ),
            Tool(
                name="Complaint",
                func=lambda x: ComplaintTool()._run(
                    user_issue=x.split("User Issue: ")[1].split("\nLegal Insights:")[0],
                    insights=x.split("Legal Insights: ")[1].split("\nUser Name:")[0],
                    user_name=x.split("User Name: ")[1].split("\nLocation:")[0],
                    location=x.split("Location: ")[1].split("\nContact:")[0],
                    contact_number=x.split("Contact: ")[1] if "Contact: " in x else None
                ),
                description="Generate a formal complaint document"
            )
        ]
        
        self.prompt = LegalDocumentPromptTemplate()
        
        # Create LLMChain
        self.llm_chain = LLMChain(
            llm=self.llm,
            prompt=self.prompt
        )
        
        # Create custom output parser
        self.output_parser = CustomOutputParser()
        
        self.agent = LLMSingleActionAgent(
            llm_chain=self.llm_chain,
            output_parser=self.output_parser,
            stop=["\nObservation:", "Thought:"],
            allowed_tools=[tool.name for tool in self.tools],
            max_iterations=3
        )
        
        self.agent_executor = AgentExecutor.from_agent_and_tools(
            agent=self.agent,
            tools=self.tools,
            verbose=True,
            max_iterations=3,
            handle_parsing_errors=True
        )
    
    def detect_language(self, text: str) -> str:
        try:
            return detect(text)
        except:
            return "en"

    def translate_text(self, text: str, target_language: str) -> str:
        if target_language == "hi":
            prompt = f"Translate the following legal document to Hindi, keeping all formatting and legal terminology:\n\n{text}\n\nHindi:"
            return self.llm([HumanMessage(content=prompt)]).content.strip()
        return text

    def classify_document(self, user_input: str) -> str:
        classification_prompt = f"""You are a legal expert tasked with classifying a legal case into one of three categories: PIL (Public Interest Litigation), RTI (Right to Information), or Complaint.

Consider the following criteria:

PIL (Public Interest Litigation):
- Involves constitutional rights or fundamental rights
- Affects public interest or public welfare
- Concerns governance, policy, or public administration
- Has broader implications for society
- Involves environmental protection, public health, or public safety
- Challenges government actions or policies
- Involves interpretation of constitutional provisions
- Affects a large number of people or public at large
- Requires judicial intervention for proper governance

RTI (Right to Information):
- Primarily about requesting specific information from public authorities
- Seeks access to documents, records, or data
- Concerns transparency and accountability
- Based on Right to Information Act, 2005
- Focuses on obtaining information rather than challenging actions
- Individual or specific information requests
- No broader public interest implications

Consumer Complaint:
- Involves defective products or deficient services
- Concerns individual consumer grievances
- Based on Consumer Protection Act
- Involves refund, replacement, or compensation claims
- Concerns specific business transactions
- Individual or specific business disputes
- No broader public interest implications

Case Details:
{user_input}

Analyze the case and determine the PRIMARY purpose and nature of the case. Consider:
1. What is the main objective of the case?
2. Who are the primary stakeholders affected?
3. What is the broader impact on society?
4. What type of relief is being sought?
5. What is the appropriate forum for resolution?

Respond with ONLY one of these three words: PIL, RTI, or Complaint.

Your response should be based on the PRIMARY purpose of the case, not secondary aspects. If the case has elements of multiple categories, choose the one that represents the main objective and impact of the case."""

        response = self.llm([HumanMessage(content=classification_prompt)]).content.strip().upper()
        
        # Ensure response is one of the valid categories
        if response not in ["PIL", "RTI", "COMPLAINT"]:
            # If response is not clear, analyze the main purpose
            if any(keyword in user_input.lower() for keyword in ["constitutional", "public interest", "environment", "governance", "policy", "public welfare"]):
                return "PIL"
            elif any(keyword in user_input.lower() for keyword in ["information", "documents", "records", "transparency"]):
                return "RTI"
            else:
                return "COMPLAINT"
        
        return response

    def generate_document(self, user_input: str, user_name: str, location: str, contact_number: str) -> str:
        try:
            language = self.detect_language(user_input)
            # Parse the user input to extract issue and insights
            input_parts = user_input.split("\n\n", 1)
            user_issue = input_parts[0]
            insights = input_parts[1] if len(input_parts) > 1 else ""
            
            # Create the input for classification
            full_input = f"User Issue: {user_issue}\nLegal Insights: {insights}\nUser Name: {user_name}\nLocation: {location}\nContact: {contact_number}"
            
            # First, classify the document
            document_type = self.classify_document(full_input)
            
            # Then generate the appropriate document
            if document_type == "PIL":
                content_path = PILTool()._run(user_issue, insights, user_name, location, contact_number, language)
            elif document_type == "RTI":
                content_path = RTITool()._run(user_issue, insights, user_name, location, contact_number, language)
            else:
                content_path = ComplaintTool()._run(user_issue, insights, user_name, location, contact_number, language)
            return content_path
                
        except Exception as e:
            raise Exception(f"Error generating document: {str(e)}") 