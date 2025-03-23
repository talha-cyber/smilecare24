from flask import Flask, request, jsonify, session
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# Load API key
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app, supports_credentials=True)
app.secret_key = "supersecretkey"  # Needed to store session data

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    
    if not user_input:
        return jsonify({'error': 'No prompt provided'}), 400

    # ✅ Custom response for "test"
    if user_input.strip().lower() == "test":
        return jsonify({'reply': "This is an automated reply to test the chatbot interface."})

    try:
        # ✅ Check if a thread exists; if not, create one
        if 'thread_id' not in session:
            thread = openai.beta.threads.create()
            session['thread_id'] = thread.id  # Save thread ID for session

        thread_id = session['thread_id']

        # ✅ First, add the user's message to the thread
        openai.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_input
        )

        # ✅ Run the assistant using the same thread
        run = openai.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id="asst_rljqa0skeZGvlY6OVUFmKY1Y",
        )

        # ✅ Wait for completion
        while True:
            run_status = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            if run_status.status == "completed":
                break

        messages = openai.beta.threads.messages.list(thread_id=thread_id)
        ai_response = messages.data[0].content[0].text.value  # Extract response text

        return jsonify({'reply': ai_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Access the application at http://localhost:5050")
    app.run(port=5050, debug=True)