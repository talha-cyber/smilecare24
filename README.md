# SmileCare24 Chat Application

This application integrates an OpenAI assistant-powered chatbot with a SmileCare24 website.

## Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)
- Node.js (optional, for serving static files if not using Flask)

### Installation

1. Clone this repository
2. Install Python dependencies:
   ```
   pip install flask flask-cors openai python-dotenv
   ```
3. Set up your OpenAI API key in the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Running the Application

1. Start the Flask server:
   ```
   python app.py
   ```
   This will start the server at http://localhost:5050

2. Open your browser and navigate to http://localhost:5050 to see the website with the integrated chatbot.

## Features

- Interactive chat interface
- Connects to OpenAI's assistant API
- Maintains chat context through sessions
- Responsive design for all device sizes

## Troubleshooting

- If you encounter CORS issues, make sure the server is running and accessible
- If the chat doesn't connect, check browser console for errors and verify your OpenAI API key # smilecare24
# smilecare24
