document.addEventListener("DOMContentLoaded", function () {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Set up the scrolling animations for circles
    setupCircleAnimations();
    
    const inputField = document.querySelector(".chat-input-field");
    const sendButton = document.getElementById("enter-button");
    const chatBox = document.getElementById("chat-box");

    // Listen for keydown events on the contenteditable div
    inputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            if (event.shiftKey) {
                // Allow new line with Shift+Enter
                document.execCommand('insertLineBreak');
                event.preventDefault();
            } else {
                event.preventDefault();
                sendMessage();
            }
        }
    });

    // Fix for focusing and scrolling issues on mobile
    inputField.addEventListener('focus', function() {
        // On mobile, scroll the page a bit to ensure the input is visible
        if (window.innerWidth <= 768) {
            setTimeout(function() {
                window.scrollTo(0, document.body.scrollHeight);
            }, 300);
        }
    });

    function autoExpand() {
        inputField.style.height = "auto"; 
        const newHeight = Math.min(inputField.scrollHeight, 120);
        inputField.style.height = newHeight + "px"; 
        inputField.style.overflowY = inputField.scrollHeight > 120 ? "auto" : "hidden";
    }

    inputField.addEventListener("input", autoExpand);
    autoExpand();

    sendButton.addEventListener("click", sendMessage);
    
    // Handle window resize (orientation changes)
    window.addEventListener('resize', function() {
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
});

// Function to set up circle animations
function setupCircleAnimations() {
    // Animation for Circle 1
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle1",
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            toggleActions: "play none none reverse"
        }
    })
    .to("#circle1", {
        filter: "blur(0px)",
        opacity: 1,
        duration: 10.5 // Duration to become unblurred
    })
    .to("#circle1", {
        y: -50,
        duration: 1.5 // Duration to move up
    }, "-=0.5")
    .to("#circle1", {
        filter: "blur(5px)",
        opacity: 0.3,
        duration: 4 // Increased duration for the unblurred state
    }, "+=40"); // Added delay before blurring again

    // Animation for Circle 2
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle2",
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            toggleActions: "play none none reverse"
        }
    })
    .to("#circle2", {
        filter: "blur(0px)",
        opacity: 1,
        duration: 10.5 // Duration to become unblurred
    })
    .to("#circle2", {
        y: -50,
        duration: 1.5 // Duration to move up
    }, "-=0.5")
    .to("#circle2", {
        filter: "blur(5px)",
        opacity: 0.3,
        duration: 4 // Increased duration for the unblurred state
    }, "+=40"); // Added delay before blurring again

    // Animation for Circle 3
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle3",
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            toggleActions: "play none none reverse"
        }
    })
    .to("#circle3", {
        filter: "blur(0px)",
        opacity: 1,
        duration: 4 // Duration to become unblurred
    })
    .to("#circle3", {
        y: -50,
        duration: 10.5 // Duration to move up
    }, "-=0.5")
    .to("#circle3", {
        filter: "blur(5px)",
        opacity: 0.3,
        duration: 10 // Increased duration for the unblurred state
    }, "+=40"); // Added delay before blurring again
}

// New async sendMessage function to handle API calls
async function sendMessage() {
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
            body: JSON.stringify({ message: message })
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
}

// Add CSS for typing animation
const typingStyle = document.createElement('style');
typingStyle.textContent = `
    @keyframes blink {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(typingStyle);