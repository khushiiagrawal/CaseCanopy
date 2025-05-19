from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from jinja2 import Environment, FileSystemLoader
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
import os
from datetime import datetime
from typing import Optional, Type
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import re
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

# Load environment variables
load_dotenv()

# Register Devanagari font for Hindi
pdfmetrics.registerFont(TTFont('NotoSansDevanagari', 'fonts/NotoSansDevanagari-Regular.ttf'))

LANGUAGE_CONFIG = {
    "en": {"font": "Times-Roman"},
    "hi": {"font": "NotoSansDevanagari"},
    # Add more languages as needed
}

class LegalDocumentInput(BaseModel):
    user_issue: str = Field(description="The main issue or concern to be addressed in the legal document")
    insights: str = Field(description="Additional legal insights or context for the document")
    user_name: str = Field(description="Name of the person filing the document")
    location: str = Field(description="Location or jurisdiction where the document is being filed")
    document_type: Optional[str] = Field(description="Type of legal document (PIL, RTI, or Complaint)")

class BaseLegalTool(BaseTool):
    name: str
    description: str
    template_file: str
    llm: ChatOpenAI = None
    env: Environment = None
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.llm = ChatOpenAI(
            temperature=0.3,
            model_name="gpt-4o-mini",
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        self.env = Environment(loader=FileSystemLoader("templates"))
        
    def _create_pdf(self, content: str, filename: str, language: str = "en") -> str:
        os.makedirs("generated_pdfs", exist_ok=True)
        filepath = os.path.join("generated_pdfs", filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=LETTER,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        font_name = LANGUAGE_CONFIG.get(language, LANGUAGE_CONFIG["en"])['font']
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(
            name='Justify',
            alignment=TA_JUSTIFY,
            fontName=font_name,
            fontSize=12,
            leading=14,
            spaceBefore=6,
            spaceAfter=6
        ))
        styles.add(ParagraphStyle(
            name='Center',
            alignment=TA_CENTER,
            fontName=font_name,
            fontSize=12,
            leading=14,
            spaceBefore=6,
            spaceAfter=6
        ))
        styles.add(ParagraphStyle(
            name='Header',
            alignment=TA_CENTER,
            fontName=font_name,
            fontSize=14,
            leading=16,
            spaceBefore=12,
            spaceAfter=12
        ))
        styles.add(ParagraphStyle(
            name='SubHeader',
            alignment=TA_JUSTIFY,
            fontName=font_name,
            fontSize=12,
            leading=14,
            spaceBefore=12,
            spaceAfter=6
        ))
        
        story = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if line.startswith(('FACTS OF THE CASE:', 'LEGAL BASIS:', 'PRAYERS:', 'VERIFICATION:')):
                story.append(Spacer(1, 12))
                story.append(Paragraph(line, styles['SubHeader']))
            elif line.startswith('To,'):
                story.append(Paragraph(line, styles['Justify']))
            elif line.startswith('Subject:'):
                story.append(Spacer(1, 12))
                story.append(Paragraph(line, styles['Justify']))
            elif line.startswith('Respected'):
                story.append(Spacer(1, 12))
                story.append(Paragraph(line, styles['Justify']))
            elif line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.')):
                story.append(Paragraph(line, styles['Justify']))
            elif line in ['Petitioner', 'Respondents']:
                story.append(Paragraph(line, styles['Center']))
            elif line.startswith(('PLACE:', 'DATE:')):
                story.append(Paragraph(line, styles['Justify']))
            else:
                story.append(Paragraph(line, styles['Justify']))
                
        doc.build(story)
        return filepath

class PILTool(BaseLegalTool):
    name = "PIL"
    description = "Generate a Public Interest Litigation (PIL) document"
    template_file = "pil_template.txt"
    
    def _generate_legal_content(self, user_issue: str, insights: str) -> tuple[str, str, list]:
        # First generate the facts of the case
        facts_prompt = (
            f"You are a senior advocate drafting a PIL petition. Given the following issue, write a concise and relevant FACTS OF THE CASE section.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 2-3 key points that are most relevant to the case. Each point should be:\n"
            f"- Clear and concise\n"
            f"- Include specific dates and facts\n"
            f"- Focus on the most critical aspects\n"
            f"- Be properly formatted as numbered points\n"
            f"- DO NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First key point]\n"
            f"2. [Second key point]\n"
            f"3. [Third key point]"
        )
        facts_messages = [HumanMessage(content=facts_prompt)]
        facts_response = self.llm(facts_messages).content
        
        # Clean up the facts response
        facts_lines = [line.strip() for line in facts_response.split('\n') if line.strip()]
        facts_lines = [re.sub(r'\*\*|\*', '', line) for line in facts_lines]
        issue_summary = '\n'.join(facts_lines)
        
        # Now generate the legal basis
        legal_prompt = (
            f"You are a senior advocate drafting a PIL petition. Given the following issue, write a concise and relevant LEGAL BASIS section.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 3-4 key legal points that are most relevant to the case. Each point should:\n"
            f"- Cite specific constitutional provisions, laws, or precedents\n"
            f"- Explain how they apply to the case\n"
            f"- Be properly formatted as numbered points\n"
            f"- DO NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First legal point with citation]\n"
            f"2. [Second legal point with citation]\n"
            f"3. [Third legal point with citation]\n"
            f"4. [Fourth legal point with citation]"
        )
        legal_messages = [HumanMessage(content=legal_prompt)]
        legal_response = self.llm(legal_messages).content
        
        # Clean up the legal response
        legal_lines = [line.strip() for line in legal_response.split('\n') if line.strip()]
        legal_lines = [re.sub(r'\*\*|\*', '', line) for line in legal_lines]
        legal_insights = '\n'.join(legal_lines)
        
        # Finally generate the prayers
        prayers_prompt = (
            f"You are a senior advocate drafting a PIL petition. Given the following issue, write 1-2 specific and relevant PRAYERS.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 1-2 specific prayers that:\n"
            f"- Are directly related to the issue\n"
            f"- Request concrete actions from the authorities\n"
            f"- Include specific timeframes where appropriate\n"
            f"- Be properly formatted as numbered points\n"
            f"- Be concise and to the point\n"
            f"- DO NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First prayer]\n"
            f"2. [Second prayer]"
        )
        prayers_messages = [HumanMessage(content=prayers_prompt)]
        prayers_response = self.llm(prayers_messages).content
        
        # Clean up and format the prayers
        prayers = [prayer.strip() for prayer in prayers_response.split('\n') if prayer.strip()]
        prayers = [re.sub(r'\*\*|\*', '', prayer) for prayer in prayers]
        prayers = [re.sub(r'^\d+\.\s*', '', prayer) for prayer in prayers]
        formatted_prayers = [f"{i+1}. {prayer}" for i, prayer in enumerate(prayers)]
        
        return issue_summary, legal_insights, formatted_prayers
    
    def _run(self, user_issue: str, insights: str, user_name: str, location: str, contact_number: str = None, language: str = "en") -> str:
        issue_summary, legal_insights, prayers = self._generate_legal_content(user_issue, insights)
        current_date = datetime.now()
        location_parts = location.split(',')
        city = location_parts[0].strip()
        state = location_parts[1].strip() if len(location_parts) > 1 else location
        respondents = [
            f"State of {state}",
            f"{state} Pollution Control Committee",
            "Ministry of Environment, Forest and Climate Change",
            "Central Pollution Control Board",
            f"Municipal Corporation of {city}",
            f"{city} Development Authority"
        ]
        template = self.env.get_template(self.template_file)
        content = template.render(
            user_name=user_name,
            user_address=city,
            location=state,
            issue_summary=issue_summary,
            legal_insights=legal_insights,
            date=current_date.strftime("%d %B, %Y"),
            year=current_date.year,
            month=current_date.strftime("%B"),
            respondents=respondents,
            petition_purpose="environmental protection and public health",
            issue_description="environmental pollution and public health hazards",
            prayers=prayers,
            contact_details=f"Contact: {contact_number or '[Contact Number]'}\nAddress: {city}"
        )
        if language != "en":
            from legal_agent import LegalDocumentAgent
            content = LegalDocumentAgent().translate_text(content, language)
        filename = f"PIL_{user_name.replace(' ', '_')}_{language}.pdf"
        return self._create_pdf(content, filename, language)

class RTITool(BaseLegalTool):
    name = "RTI"
    description = "Generate a Right to Information (RTI) application"
    template_file = "rti_template.txt"
    
    def _generate_legal_content(self, user_issue: str, insights: str) -> tuple[str, str, str, list]:
        # First generate the information sought
        info_prompt = (
            f"You are a legal expert drafting an RTI application. Given the following issue, write a clear and specific INFORMATION SOUGHT section.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 4-5 specific information points that:\n"
            f"- Are clear and precise\n"
            f"- Request specific data or documents\n"
            f"- Be properly formatted as numbered points\n"
            f"- NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First information point]\n"
            f"2. [Second information point]\n"
            f"3. [Third information point]\n"
            f"4. [Fourth information point]\n"
            f"5. [Fifth information point]"
        )
        info_messages = [HumanMessage(content=info_prompt)]
        info_response = self.llm(info_messages).content
        
        # Clean up the information sought response
        info_lines = [line.strip() for line in info_response.split('\n') if line.strip()]
        info_lines = [re.sub(r'\*\*|\*', '', line) for line in info_lines]
        information_sought = '\n'.join(info_lines)
        
        # Generate the legal basis
        legal_prompt = (
            f"You are a legal expert drafting an RTI application. Given the following issue, write a concise and relevant LEGAL BASIS section.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 3-4 key legal points that:\n"
            f"- Cite specific sections of RTI Act\n"
            f"- Explain how they apply to the case\n"
            f"- Be properly formatted as numbered points\n"
            f"- NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First legal point with citation]\n"
            f"2. [Second legal point with citation]\n"
            f"3. [Third legal point with citation]\n"
            f"4. [Fourth legal point with citation]"
        )
        legal_messages = [HumanMessage(content=legal_prompt)]
        legal_response = self.llm(legal_messages).content
        
        # Clean up the legal response
        legal_lines = [line.strip() for line in legal_response.split('\n') if line.strip()]
        legal_lines = [re.sub(r'\*\*|\*', '', line) for line in legal_lines]
        legal_basis = '\n'.join(legal_lines)
        
        # Generate the department details
        department_prompt = (
            f"You are a legal expert drafting an RTI application. Given the following issue, determine the appropriate department details.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate:\n"
            f"1. The specific department name\n"
            f"2. Any additional information or requirements\n"
            f"Format the response as:\n"
            f"Department: [department name]\n"
            f"Additional Info: [any additional information]"
        )
        department_messages = [HumanMessage(content=department_prompt)]
        department_response = self.llm(department_messages).content
        
        # Parse department details
        department_lines = [line.strip() for line in department_response.split('\n') if line.strip()]
        department_dict = {}
        for line in department_lines:
            if line.startswith('Department:'):
                department_dict['name'] = line.replace('Department:', '').strip()
            elif line.startswith('Additional Info:'):
                department_dict['additional_info'] = line.replace('Additional Info:', '').strip()
        
        # Determine the appropriate pollution control board
        if 'pollution' in user_issue.lower() or 'environment' in user_issue.lower():
            # Extract state from insights if available
            state_match = re.search(r'State of ([^,]+)', insights)
            if state_match:
                state = state_match.group(1)
                department_dict['name'] = f"{state} State Pollution Control Board"
            else:
                department_dict['name'] = "Central Pollution Control Board"
        
        # Generate additional information list
        additional_info = [line.strip() for line in department_dict.get('additional_info', '').split('\n') if line.strip()]
        formatted_additional_info = [f"{i+1}. {info}" for i, info in enumerate(additional_info)]
        
        return information_sought, legal_basis, department_dict.get('name', 'Revenue Department'), formatted_additional_info
    
    def _run(self, user_issue: str, insights: str, user_name: str, location: str, contact_number: str = None, language: str = "en") -> str:
        information_sought, legal_basis, department_name, additional_info = self._generate_legal_content(user_issue, insights)
        current_date = datetime.now().strftime("%d %B, %Y")
        location_parts = location.split(',')
        city = location_parts[0].strip()
        state = location_parts[1].strip() if len(location_parts) > 1 else ""
        template = self.env.get_template(self.template_file)
        content = template.render(
            applicant_name=user_name,
            applicant_address=city,
            department_name=department_name,
            office_address=f"{city}",
            location=state,
            information_sought=information_sought,
            legal_basis=legal_basis,
            additional_info=additional_info,
            date=current_date,
            contact_number=contact_number if contact_number else "[Contact Number Not Provided]"
        )
        if language != "en":
            from legal_agent import LegalDocumentAgent
            content = LegalDocumentAgent().translate_text(content, language)
        filename = f"RTI_{user_name.replace(' ', '_')}_{language}.pdf"
        return self._create_pdf(content, filename, language)

class ComplaintTool(BaseLegalTool):
    name = "Complaint"
    description = "Generate a formal complaint document"
    template_file = "complaint_template.txt"
    
    def _generate_legal_content(self, user_issue: str, insights: str) -> tuple[str, str, str, str, str, list, list]:
        # First generate the facts of the case
        facts_prompt = (
            f"You are a legal expert drafting a consumer complaint. Given the following issue, write a concise and relevant FACTS OF THE CASE section.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 3-4 key points that are most relevant to the case. Each point should:\n"
            f"- Include specific dates and facts\n"
            f"- Be clear and concise\n"
            f"- Focus on the most critical aspects\n"
            f"- Be properly formatted as numbered points\n"
            f"- NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First key point]\n"
            f"2. [Second key point]\n"
            f"3. [Third key point]\n"
            f"4. [Fourth key point]"
        )
        facts_messages = [HumanMessage(content=facts_prompt)]
        facts_response = self.llm(facts_messages).content
        
        # Clean up the facts response
        facts_lines = [line.strip() for line in facts_response.split('\n') if line.strip()]
        facts_lines = [re.sub(r'\*\*|\*', '', line) for line in facts_lines]
        issue_summary = '\n'.join(facts_lines)
        
        # Generate the legal basis
        legal_prompt = (
            f"You are a legal expert drafting a consumer complaint. Given the following issue, write a concise and relevant LEGAL BASIS section.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 3-4 key legal points that are most relevant to the case. Each point should:\n"
            f"- Cite specific sections of Consumer Protection Act or relevant laws\n"
            f"- Explain how they apply to the case\n"
            f"- Be properly formatted as numbered points\n"
            f"- NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First legal point with citation]\n"
            f"2. [Second legal point with citation]\n"
            f"3. [Third legal point with citation]\n"
            f"4. [Fourth legal point with citation]"
        )
        legal_messages = [HumanMessage(content=legal_prompt)]
        legal_response = self.llm(legal_messages).content
        
        # Clean up the legal response
        legal_lines = [line.strip() for line in legal_response.split('\n') if line.strip()]
        legal_lines = [re.sub(r'\*\*|\*', '', line) for line in legal_lines]
        legal_insights = '\n'.join(legal_lines)
        
        # Generate the authority details
        authority_prompt = (
            f"You are a legal expert drafting a consumer complaint. Given the following issue, determine the appropriate authority details.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate:\n"
            f"1. The designation of the authority (e.g., 'The Presiding Officer')\n"
            f"2. The name of the authority (e.g., 'Consumer Disputes Redressal Commission')\n"
            f"3. A clear, concise subject line for the complaint\n"
            f"Format the response as:\n"
            f"Designation: [authority designation]\n"
            f"Name: [authority name]\n"
            f"Subject: [complaint subject]"
        )
        authority_messages = [HumanMessage(content=authority_prompt)]
        authority_response = self.llm(authority_messages).content
        
        # Parse authority details
        authority_lines = [line.strip() for line in authority_response.split('\n') if line.strip()]
        authority_dict = {}
        for line in authority_lines:
            if line.startswith('Designation:'):
                authority_dict['designation'] = line.replace('Designation:', '').strip()
            elif line.startswith('Name:'):
                authority_dict['name'] = line.replace('Name:', '').strip()
            elif line.startswith('Subject:'):
                authority_dict['subject'] = line.replace('Subject:', '').strip()
        
        # Generate the prayers
        prayers_prompt = (
            f"You are a legal expert drafting a consumer complaint. Given the following issue, write specific and relevant PRAYERS.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 2-3 specific prayers that:\n"
            f"- Are directly related to the issue\n"
            f"- Request concrete actions from the authority\n"
            f"- Include specific timeframes where appropriate\n"
            f"- Be properly formatted as numbered points\n"
            f"- Be concise and to the point\n"
            f"- NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First prayer]\n"
            f"2. [Second prayer]\n"
            f"3. [Third prayer]"
        )
        prayers_messages = [HumanMessage(content=prayers_prompt)]
        prayers_response = self.llm(prayers_messages).content
        
        # Clean up and format the prayers
        prayers = [prayer.strip() for prayer in prayers_response.split('\n') if prayer.strip()]
        prayers = [re.sub(r'\*\*|\*', '', prayer) for prayer in prayers]
        prayers = [re.sub(r'^\d+\.\s*', '', prayer) for prayer in prayers]
        formatted_prayers = [f"{i+1}. {prayer}" for i, prayer in enumerate(prayers)]
        
        # Generate the documents list
        documents_prompt = (
            f"You are a legal expert drafting a consumer complaint. Given the following issue, list the relevant documents to be enclosed.\n"
            f"Issue: {user_issue}\n"
            f"Additional Context: {insights}\n"
            f"Generate 4-5 specific documents that:\n"
            f"- Are relevant to the case\n"
            f"- Support the claims made\n"
            f"- Be properly formatted as numbered points\n"
            f"- NOT use any markdown formatting or special characters\n"
            f"Format the response as:\n"
            f"1. [First document]\n"
            f"2. [Second document]\n"
            f"3. [Third document]\n"
            f"4. [Fourth document]\n"
            f"5. [Fifth document]"
        )
        documents_messages = [HumanMessage(content=documents_prompt)]
        documents_response = self.llm(documents_messages).content
        
        # Clean up and format the documents
        documents = [doc.strip() for doc in documents_response.split('\n') if doc.strip()]
        documents = [re.sub(r'\*\*|\*', '', doc) for doc in documents]
        documents = [re.sub(r'^\d+\.\s*', '', doc) for doc in documents]
        formatted_documents = [f"{i+1}. {doc}" for i, doc in enumerate(documents)]
        
        return (
            issue_summary,
            legal_insights,
            authority_dict.get('designation', 'The Presiding Officer'),
            authority_dict.get('name', 'Consumer Disputes Redressal Commission'),
            authority_dict.get('subject', 'Complaint regarding defective product and deficient service'),
            formatted_prayers,
            formatted_documents
        )
    
    def _run(self, user_issue: str, insights: str, user_name: str, location: str, contact_number: str = None, language: str = "en") -> str:
        issue_summary, legal_insights, authority_designation, authority_name, complaint_subject, prayers, documents = self._generate_legal_content(user_issue, insights)
        current_date = datetime.now().strftime("%d %B, %Y")
        respondent_match = re.search(r"from\s+([^,]+)", user_issue)
        respondent_name = respondent_match.group(1) if respondent_match else "Concerned Authority"
        template = self.env.get_template(self.template_file)
        content = template.render(
            user_name=user_name,
            authority_designation=authority_designation,
            authority_name=authority_name,
            authority_address=f"{location}",
            location=location,
            respondent_name=respondent_name,
            complaint_subject=complaint_subject,
            issue_summary=issue_summary,
            legal_insights=legal_insights,
            prayers=prayers,
            documents=documents,
            date=current_date,
            contact_details=f"Contact: {contact_number or '[Contact Number]'}\nAddress: {location}"
        )
        if language != "en":
            from legal_agent import LegalDocumentAgent
            content = LegalDocumentAgent().translate_text(content, language)
        filename = f"Complaint_{user_name.replace(' ', '_')}_{language}.pdf"
        return self._create_pdf(content, filename, language) 