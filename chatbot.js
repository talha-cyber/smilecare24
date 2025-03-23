// This script adds OpenAI API integration to the existing chat interface
document.addEventListener("DOMContentLoaded", function() {
    console.log("ChatBot integration loaded");
    
    // The existing sendMessage function in script.js will be enhanced with API capabilities
    // This is done by overriding the function after the original script loads
    
    // Get the original sendMessage function
    const originalSendMessage = window.sendMessage;
    
    // Override the sendMessage function with our enhanced version
    window.sendMessage = async function() {
        const inputField = document.querySelector(".chat-input-field");
        const message = inputField.innerText.trim();
        if (message === "") return;
    
        const chatBox = document.getElementById("chat-box");
    
        // Append user message
        const userMessage = document.createElement("div");
        userMessage.classList.add("chat-message", "user-message");
        userMessage.textContent = message;
        chatBox.appendChild(userMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    
        // Reset input field
        inputField.innerHTML = "";
        inputField.style.height = "40px";
    
        // Append AI typing indicator
        const aiTyping = document.createElement("div");
        aiTyping.classList.add("chat-message", "ai-message", "typing-indicator");
        aiTyping.innerHTML = "<span>.</span><span>.</span><span>.</span>";
        chatBox.appendChild(aiTyping);
        chatBox.scrollTop = chatBox.scrollHeight;
    
        try {
            // Send message to server
            const response = await fetch("http://127.0.0.1:5050/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message }),
                credentials: 'include' // This is important for session cookies
            });
            
            // Remove typing indicator
            chatBox.removeChild(aiTyping);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Display AI response
            const aiResponse = document.createElement("div");
            aiResponse.classList.add("chat-message", "ai-message");
            aiResponse.textContent = data.reply;
            chatBox.appendChild(aiResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
            
        } catch (error) {
            // Remove typing indicator
            chatBox.removeChild(aiTyping);
            
            console.error('Error:', error);
            
            // Display error message
            const errorMessage = document.createElement("div");
            errorMessage.classList.add("chat-message", "ai-message", "error-message");
            errorMessage.textContent = "Fehler: AI ist nicht erreichbar. Bitte versuchen Sie es später erneut.";
            errorMessage.style.color = "red";
            chatBox.appendChild(errorMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };
    
    console.log("ChatBot integration complete");
}); 