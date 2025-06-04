from flask import Flask, request, jsonify, session
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv
import re
import html
import uuid
import time
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage

# Load API key
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, supports_credentials=True)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "a_default_fallback_key_if_not_set")

# Store thread IDs and LangChain memories per session
session_threads = {}
session_memories = {}

# Assistant ID
ASSISTANT_ID = "asst_rljqa0skeZGvlY6OVUFmKY1Y"

def get_or_create_thread(session_id):
    """Get or create a thread for a session"""
    if session_id not in session_threads:
        thread = client.beta.threads.create()
        session_threads[session_id] = thread.id
        print(f"Created new thread {thread.id} for session {session_id}")
    return session_threads[session_id]

def get_session_memory(session_id):
    """Get or create LangChain memory for a session"""
    if session_id not in session_memories:
        session_memories[session_id] = ConversationBufferWindowMemory(
            k=20,  # Keep last 20 exchanges
            return_messages=True
        )
    return session_memories[session_id]

def wait_for_run_completion(thread_id, run_id, max_wait=30):
    """Wait for the assistant run to complete"""
    start_time = time.time()
    while time.time() - start_time < max_wait:
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
        if run.status == 'completed':
            return run
        elif run.status in ['failed', 'cancelled', 'expired']:
            raise Exception(f"Run failed with status: {run.status}")
        time.sleep(0.5)
    raise Exception("Run timed out")

def format_text_to_html_table(text_content):
    """Format text for HTML display, including bolding and table conversion"""
    lines = text_content.strip().split('\n')
    output_parts = []
    i = 0
    while i < len(lines):
        current_line = lines[i]
        
        is_potential_header = '|' in current_line and not re.match(r'^\|?\s*-+\s*\|?(-+\s*\|?)*$', current_line.strip())
        
        if is_potential_header and (i + 1) < len(lines):
            next_line = lines[i+1]
            is_separator = re.match(r'^\|?\s*([:-]-+)+\s*\|?(\s*[|:]\s*([:-]-+)+\s*\|?)*$', next_line.strip())
            
            if is_separator:
                raw_header_cells = current_line.split('|')
                header_cells_content = [cell.strip() for cell in raw_header_cells if cell.strip()]
                num_columns = len(header_cells_content)

                if num_columns > 0:
                    actual_data_rows_md = []
                    k = i + 2 
                    while k < len(lines):
                        data_line_candidate = lines[k]
                        if '|' not in data_line_candidate: 
                            break
                        if re.match(r'^\|?\s*([:-]-+)+\s*\|?(\s*[|:]\s*([:-]-+)+\s*\|?)*$', data_line_candidate.strip()):
                            break
                        raw_data_cells_candidate = data_line_candidate.split('|')
                        data_cells_content_candidate = [cell.strip() for cell in raw_data_cells_candidate if cell.strip()]
                        if data_cells_content_candidate:
                            actual_data_rows_md.append(data_line_candidate)
                            k += 1
                        else: 
                            break 
                    
                    if header_cells_content: 
                        html_table_rows = []
                        header_html = "<thead><tr>"
                        for cell_content in header_cells_content:
                            header_html += f"<th style=\"border: 1px solid #ccc; padding: 8px; text-align: left;\">{html.escape(cell_content)}</th>"
                        header_html += "</tr></thead>"
                        html_table_rows.append(header_html)
                        
                        body_html = "<tbody>"
                        for md_data_row in actual_data_rows_md:
                            raw_data_cells = md_data_row.split('|')
                            data_cells_actual = [cell.strip() for cell in raw_data_cells if cell.strip()]
                            body_html += "<tr>"
                            for cell_idx in range(num_columns):
                                if cell_idx < len(data_cells_actual):
                                    cell_content = data_cells_actual[cell_idx]
                                    # Step 1: Convert newline characters to <br> tags
                                    content_with_br_from_newlines = cell_content.replace('\n', '<br>')
                                    # Step 2: Normalize all <br> variants (including those just created) to a simple <br> tag
                                    normalized_br_content = re.sub(r'<br\s*/?>', '<br>', content_with_br_from_newlines, flags=re.IGNORECASE)
                                    # Step 3: Convert Markdown bold to <strong> tags
                                    content_after_bold = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', normalized_br_content)
                                    # Step 4: Escape the entire result for security
                                    escaped_content = html.escape(content_after_bold)
                                    # Step 5: Un-escape the normalized <br> tag and <strong> tags
                                    final_content_br = escaped_content.replace('&lt;br&gt;', '<br>')
                                    final_content = final_content_br.replace('&lt;strong&gt;', '<strong>').replace('&lt;/strong&gt;', '</strong>')
                                    body_html += f"<td style=\"border: 1px solid #ccc; padding: 8px;\">{final_content}</td>"
                                else:
                                    body_html += f"<td style=\"border: 1px solid #ccc; padding: 8px;\"></td>" 
                            body_html += "</tr>\n"
                        body_html += "</tbody>"
                        html_table_rows.append(body_html)
                        output_parts.append(f"<table border=\"1\" style=\"border-collapse: collapse; width: auto; margin-top: 1em; margin-bottom: 1em;\">{' '.join(html_table_rows)}</table>")
                        i = k 
                        continue
        current_line_formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html.escape(current_line))
        output_parts.append(current_line_formatted)
        i += 1
    return "<br>".join(output_parts).replace("<br><br><br>", "<br><br>")

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/reset-chat', methods=['POST'])
def reset_chat():
    """Reset the chat session"""
    session_id = session.get('session_id')
    if session_id:
        # Clear both thread and LangChain memory
        if session_id in session_threads:
            del session_threads[session_id]
        if session_id in session_memories:
            del session_memories[session_id]
    session.clear()
    app.logger.info("Chat session reset - new conversation started")
    return jsonify({'message': 'Chat session reset successfully'})

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    
    if not user_input:
        return jsonify({'error': 'No prompt provided'}), 400

    if user_input.strip().lower() == "test":
        formatted_reply = format_text_to_html_table("This is an automated reply to test the chatbot interface.")
        return jsonify({'reply': formatted_reply})

    if not ASSISTANT_ID:
        return jsonify({'error': 'Assistant ID not configured'}), 500

    try:
        # Get or create session ID
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
        
        session_id = session['session_id']
        thread_id = get_or_create_thread(session_id)
        memory = get_session_memory(session_id)
        
        # Save user message to LangChain memory
        memory.chat_memory.add_user_message(user_input)
        
        app.logger.info(f"Using thread {thread_id} and LangChain memory for session {session_id}")
        
        # Optional: Get context from LangChain memory
        chat_history = memory.chat_memory.messages
        recent_context = chat_history[-6:] if len(chat_history) > 6 else chat_history
        
        # Add message to OpenAI thread
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_input
        )
        
        # Extract summary from memory (basic example – can be smarter)
        age = None
        coverage = None
        for msg in reversed(chat_history):
            if isinstance(msg, HumanMessage):
                if not age:
                    match = re.search(r"\b(1[89]|[2-9][0-9])\b", msg.content)
                    if match:
                        age = match.group(0)
                if not coverage:
                    if "basis" in msg.content.lower():
                        coverage = "Basis"
                    elif "premium" in msg.content.lower() or "umfang" in msg.content.lower():
                        coverage = "Premium"

        instructions = ""
        if age:
            instructions += f"Der Nutzer ist {age} Jahre alt. "
        if coverage:
            instructions += f"Er/Sie interessiert sich für {coverage}-Schutz. "

        run = client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=ASSISTANT_ID,
            additional_instructions=instructions
        )

        
        # Wait for completion
        completed_run = wait_for_run_completion(thread_id, run.id)
        
        # Get the assistant's response
        messages = client.beta.threads.messages.list(thread_id=thread_id, limit=1)
        ai_response = messages.data[0].content[0].text.value
        
        # Save AI response to LangChain memory
        memory.chat_memory.add_ai_message(ai_response)
        
        # Format response for HTML
        formatted_response = format_text_to_html_table(ai_response)
        
        app.logger.info(f"AI Response: {ai_response}")
        app.logger.info(f"LangChain memory has {len(memory.chat_memory.messages)} messages")
        
        return jsonify({'reply': formatted_response})

    except Exception as e:
        app.logger.error(f"Critical error in /chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f"An unexpected server error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Access the application at http://localhost:5051")
    app.run(port=5051, debug=True)