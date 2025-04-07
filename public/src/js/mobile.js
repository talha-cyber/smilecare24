// Mobile-optimized JavaScript for SmileCare24
document.addEventListener("DOMContentLoaded", function () {
    console.log("Mobile version loaded");
    
    // Set up the circle flip animations
    setupCircleFlipAnimations();
    
    // Set up scrolling animations for text blocks (simpler for mobile)
    setupTextBlockAnimations();
    
    // Set up FAQ animations and interactions
    setupFAQSection();
    
    // Add flip guide text to each circle
    addFlipGuideText();
    
    // Chat functionality setup
    setupChatFunctionality();
    
    // Add fastclick polyfill for removing 300ms tap delay on mobile
    FastClick.attach(document.body);
});

// Function to add flip guide text to each circle
function addFlipGuideText() {
    const circleWrappers = document.querySelectorAll('.circle-wrapper');
    
    circleWrappers.forEach((wrapper) => {
        const flipGuide = document.createElement('div');
        flipGuide.classList.add('flip-guide');
        flipGuide.textContent = 'Tippen zum Umdrehen';
        wrapper.appendChild(flipGuide);
    });
}

// Function to set up the circle flip animations
function setupCircleFlipAnimations() {
    // Get all circle wrapper elements
    const circleWrappers = document.querySelectorAll('.circle-wrapper');
    
    // Make circles interactive for mobile (tap to flip)
    circleWrappers.forEach((wrapper) => {
        const circle = wrapper.querySelector('.circle');
        const content = wrapper.querySelector('.circle-content-container');
        
        // Move content container into the circle wrapper if not already there
        if (content && content.parentNode !== wrapper) {
            content.parentNode.removeChild(content);
            wrapper.appendChild(content);
        }
        
        // Add tap event to flip the circle
        wrapper.addEventListener('click', function() {
            this.classList.toggle('flipped');
            
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
        
        // Additional touch feedback
        wrapper.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        wrapper.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Use IntersectionObserver to animate circles as they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fast-fade-in');
                // Unobserve after animation is applied
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Observe all circle wrappers
    circleWrappers.forEach(wrapper => {
        observer.observe(wrapper);
    });
}

// Function to set up text block animations (simpler for mobile)
function setupTextBlockAnimations() {
    const textBlocks = document.querySelectorAll('.text-block-left, .text-block-right');
    
    // Use IntersectionObserver for more efficient animations on mobile
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // Unobserve after animation is applied
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all text blocks
    textBlocks.forEach(block => {
        observer.observe(block);
    });
}

// Function to set up FAQ section
function setupFAQSection() {
    // Get all FAQ question elements
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Add click event to each FAQ question
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // Get the parent FAQ item
            const faqItem = question.parentElement;
            
            // Toggle active class on the FAQ item
            faqItem.classList.toggle('active');
            
            // Add haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        });
    });
    
    // Use IntersectionObserver for FAQ animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animations slightly
                setTimeout(() => {
                    entry.target.classList.add('fade-in');
                }, index * 100);
                
                // Unobserve after animation is applied
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        observer.observe(item);
    });
}

// Function to set up chat functionality
function setupChatFunctionality() {
    const inputField = document.querySelector(".chat-input-field");
    const sendButton = document.getElementById("enter-button");
    const chatBox = document.getElementById("chat-box");

    // Prevent iOS from zooming in on input focus
    if (inputField) {
        inputField.style.fontSize = '16px';
        
        // Listen for keydown events on the contenteditable div
        inputField.addEventListener("keydown", function(event) {
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
            setTimeout(function() {
                window.scrollTo(0, document.body.scrollHeight);
            }, 300);
        });

        function autoExpand() {
            inputField.style.height = "auto"; 
            const newHeight = Math.min(inputField.scrollHeight, 90); // Reduced max height for mobile
            inputField.style.height = newHeight + "px"; 
            inputField.style.overflowY = inputField.scrollHeight > 90 ? "auto" : "hidden";
        }

        inputField.addEventListener("input", autoExpand);
        autoExpand();
    }

    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }
    
    // Handle window resize (orientation changes)
    window.addEventListener('resize', function() {
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
}

// Send message function for chat
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
    inputField.style.height = "30px"; // Smaller for mobile

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
        
        // Provide tactile feedback on message received
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
        
    } catch (error) {
        // Remove typing indicator
        chatBox.removeChild(aiTyping);
        
        console.error('Error:', error);
        
        // Display error message
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("chat-message", "ai-message", "error-message");
        errorMessage.textContent = "Fehler: AI ist nicht erreichbar. Bitte versuche es später erneut.";
        errorMessage.style.color = "red";
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// FastClick polyfill for removing touch delay on mobile
(function() {
    function FastClick(layer, options) {
        var oldOnClick;
        this.trackingClick = false;
        this.layer = layer;
        this.options = options || {};
        
        if (FastClick.notNeeded(layer)) {
            return;
        }
        
        layer.addEventListener('touchstart', this.onClick, true);
        layer.addEventListener('click', this.onClick, true);
    }
    
    FastClick.prototype.onClick = function(event) {
        event.target.click();
    }
    
    FastClick.notNeeded = function(layer) {
        return false;
    }
    
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    }
    
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
}()); 