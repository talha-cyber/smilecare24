document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded");
    
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.error("GSAP is not loaded!");
        return;
    }
    
    // Initialize GSAP ScrollTrigger
    if (typeof ScrollTrigger === 'undefined') {
        console.error("ScrollTrigger plugin is not loaded!");
    } else {
        gsap.registerPlugin(ScrollTrigger);
        console.log("GSAP ScrollTrigger registered");
    }
    
    // Check if user is on mobile
    const isMobile = window.innerWidth <= 768;
    console.log("Is mobile:", isMobile);
    
    // Set up the appropriate animations based on device
    if (isMobile) {
        setupMobileExperience();
    } else {
        // Desktop experience
        setupCircleAnimations();
        setupTextBlockAnimations();
        setupHeadlinePinningAnimation();
    }
    
    // Set up FAQ animations and interactions (for both mobile and desktop)
    setupFAQSection();
    
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
        if (isMobile) {
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
        
        // Reload the page if switching between mobile and desktop
        const wasMobile = isMobile;
        const isNowMobile = window.innerWidth <= 768;
        
        if (wasMobile !== isNowMobile) {
            window.location.reload();
        }
    });
});

// Mobile experience setup
function setupMobileExperience() {
    // Create mobile circles if they don't exist
    createMobileCircleCards();
    
    // Set up mobile circle cards with scroll effects
    setupMobileCircleCards();
    
    // Set up mobile text block animations
    setupMobileTextBlockAnimations();
    
    // REMOVED old accordion setups
    // setupMobileAccordion(); // REMOVED
    // setupGsapAccordion(); // REMOVED
    
    // Hide navbar on scroll down, show on scroll up
    setupMobileNavbar();
    
    // Set up hamburger menu
    setupHamburgerMenu();
    
    // Add PWA-specific enhancements
    addPWAFeatures();

    // --- START: Floating Mobile Chat Logic ---
    const chatWidgetContainer = document.getElementById('chat-widget-container');
    const chatCtaButton = document.getElementById('chat-cta-button');
    const chatMinimizedBubble = document.getElementById('chat-minimized-bubble');
    const chatWindow = document.getElementById('chat-window');
    const minimizeButton = document.getElementById('minimize-chat');
    const dropZone = document.getElementById('drop-zone');
    const chatArea = document.getElementById('mobile-chat-area'); // Use new ID
    const chatInput = document.getElementById('mobile-chat-input'); // Use new ID
    const sendButton = document.getElementById('mobile-send-button'); // Use new ID

    // Check if elements exist before adding listeners
    if (!chatWidgetContainer || !chatCtaButton || !chatMinimizedBubble || !chatWindow || !minimizeButton || !dropZone || !chatArea || !chatInput || !sendButton) {
        console.warn("One or more mobile chat elements not found. Skipping mobile chat setup.");
        return; // Exit if elements are missing
    }

    // --- State ---
    let isDragging = false; // Flag to prevent click during drag

    // --- Positioning ---
    let bubblePosition = { x: 0, y: 0 }; // Relative to initial fixed pos

    // --- Make setState globally accessible (or via an object) for external triggers --- 
    let mobileChatSetState = () => { console.warn('setState not initialized'); };

    // --- Event Listeners ---
    chatCtaButton.addEventListener('click', () => {
        setState('state-open');
    });

    chatMinimizedBubble.addEventListener('click', () => {
         if (!isDragging) {
            setState('state-open');
        }
        setTimeout(() => isDragging = false, 0);
    });

    minimizeButton.addEventListener('click', () => {
        setState('state-minimized-bubble');
    });

    sendButton.addEventListener('click', sendMobileMessage); // Use new function name
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMobileMessage(); // Use new function name
        }
    });

    // --- Functions ---
    function setState(newState) {
        const currentState = getCurrentState();
        if (currentState === newState) return;

        if (newState === 'state-minimized-bubble' && chatMinimizedBubble.classList.contains('dropped')) {
            console.log('Bubble was dropped, cannot minimize. Reverting to initial state.');
            setState('state-initial');
            return;
        }

        console.log(`Changing state from ${currentState} to ${newState}`);
        chatWidgetContainer.classList.remove('state-initial', 'state-open', 'state-minimized-bubble');
        chatWidgetContainer.classList.add(newState);

        if (currentState === 'state-minimized-bubble' && newState === 'state-open') {
            resetBubblePosition();
        } else if (newState === 'state-minimized-bubble') {
             if (!isDragging) {
                resetBubblePosition();
             }
        }

        if (newState === 'state-open') {
             scrollToBottom();
             chatMinimizedBubble.classList.remove('dropped');
             chatInput.focus(); // Focus input when opening
        } else if (newState === 'state-minimized-bubble') {
            document.activeElement.blur();
        } else if (newState === 'state-initial') {
             if (currentState === 'state-open') {
                 resetBubblePosition();
             }
             document.activeElement.blur();
        }
    }

    // Assign the internal setState function to the globally accessible one
    mobileChatSetState = setState;

    function getCurrentState() {
        if (chatWidgetContainer.classList.contains('state-open')) return 'state-open';
        if (chatWidgetContainer.classList.contains('state-minimized-bubble')) return 'state-minimized-bubble';
        return 'state-initial';
    }

    function resetBubblePosition() {
        console.log('Resetting bubble position');
        bubblePosition = { x: 0, y: 0 };
        chatMinimizedBubble.style.transform = '';
        chatMinimizedBubble.classList.remove('dropped');
    }

    async function sendMobileMessage() {
        const messageText = chatInput.value.trim();
        if (messageText) {
            // Append user message to mobile chat area
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'sent');
            messageElement.textContent = messageText;
            chatArea.appendChild(messageElement);
            chatInput.value = '';
            scrollToBottom();

            // Append AI typing indicator to mobile chat area
            const aiTyping = document.createElement("div");
            aiTyping.classList.add("message", "received", "typing-indicator"); // Use 'received' class for styling
            aiTyping.innerHTML = "<span>.</span><span>.</span><span>.</span>";
            chatArea.appendChild(aiTyping);
            scrollToBottom();

            try {
                // Send message to server (using the same endpoint as desktop chat)
                const response = await fetch("http://127.0.0.1:5050/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: messageText })
                });

                chatArea.removeChild(aiTyping);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Display AI response in mobile chat area
                const aiResponse = document.createElement("div");
                aiResponse.classList.add("message", "received"); // Use 'received' class for styling
                aiResponse.textContent = data.reply;
                chatArea.appendChild(aiResponse);
                scrollToBottom();

            } catch (error) {
                chatArea.removeChild(aiTyping);
                console.error('Error:', error);

                // Display error message in mobile chat area
                const errorMessage = document.createElement("div");
                errorMessage.classList.add("message", "received", "error-message"); // Use 'received' class
                errorMessage.textContent = "Fehler: AI ist nicht erreichbar. Bitte versuchen Sie es später erneut.";
                errorMessage.style.color = "red";
                chatArea.appendChild(errorMessage);
                scrollToBottom();
            }
        }
    }

    function scrollToBottom() {
        // Small delay to ensure DOM update before scrolling
        setTimeout(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 50);
    }

    // --- Drag and Drop Logic (InteractJS for Minimized Bubble) ---
    if (typeof interact !== 'undefined') {
        interact('#chat-minimized-bubble')
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'body',
                        endOnly: true
                    })
                ],
                autoScroll: false,
                listeners: {
                    start (event) {
                        isDragging = true;
                        dropZone.classList.add('visible');
                        chatMinimizedBubble.style.transition = 'none';
                    },
                    move (event) {
                        bubblePosition.x += event.dx;
                        bubblePosition.y += event.dy;
                        event.target.style.transform = `translate(${bubblePosition.x}px, ${bubblePosition.y}px)`;

                        const dropRect = dropZone.getBoundingClientRect();
                        const targetRect = event.target.getBoundingClientRect();
                        const targetCenterX = targetRect.left + targetRect.width / 2;
                        const targetCenterY = targetRect.top + targetRect.height / 2;
                        const dropCenterX = dropRect.left + dropRect.width / 2;
                        const dropCenterY = dropRect.top + dropRect.height / 2;
                        const dropRadius = dropRect.width / 2;
                        const distance = Math.sqrt(Math.pow(targetCenterX - dropCenterX, 2) + Math.pow(targetCenterY - dropCenterY, 2));
                        const isOverDropZone = distance < dropRadius;

                         if (isOverDropZone) {
                            dropZone.style.backgroundColor = 'rgba(255,0,0,0.4)';
                            dropZone.style.transform = 'translateX(-50%) scale(1.1)';
                         } else {
                            dropZone.style.backgroundColor = 'rgba(255,0,0,0.2)';
                            dropZone.style.transform = 'translateX(-50%) scale(1)';
                         }
                    },
                    end (event) {
                        if (!isDragging) return;

                        dropZone.classList.remove('visible');
                        dropZone.style.backgroundColor = 'rgba(255,0,0,0.2)';
                        dropZone.style.transform = 'translateX(-50%) scale(1)';
                        chatMinimizedBubble.style.transition = '';

                        const dropRect = dropZone.getBoundingClientRect();
                        const targetRect = event.target.getBoundingClientRect();
                        const targetCenterX = targetRect.left + targetRect.width / 2;
                        const targetCenterY = targetRect.top + targetRect.height / 2;
                        const dropCenterX = dropRect.left + dropRect.width / 2;
                        const dropCenterY = dropRect.top + dropRect.height / 2;
                        const dropRadius = dropRect.width / 2;
                        const distance = Math.sqrt(Math.pow(targetCenterX - dropCenterX, 2) + Math.pow(targetCenterY - dropCenterY, 2));
                        const isDroppedInZone = distance < dropRadius;

                        if (isDroppedInZone) {
                            console.log('Bubble dropped in zone.');
                            chatMinimizedBubble.classList.add('dropped');
                            setState('state-initial');
                        } else {
                            // Optional: Snap back to edge or stay where dropped
                        }

                        setTimeout(() => { isDragging = false; }, 0);
                    }
                }
            });
    } else {
        console.warn("interact.js not loaded. Drag-and-drop for chat bubble will not work.");
    }
    // --- END: Floating Mobile Chat Logic ---
}

// Create mobile circle cards dynamically if they don't exist
function createMobileCircleCards() {
    // Check if mobile circle container already exists
    if (document.getElementById('mobile-circle-container')) return;
    
    // Create mobile circle container
    const mobileCircleContainer = document.createElement('div');
    mobileCircleContainer.className = 'mobile-circle-container mobile-only';
    mobileCircleContainer.id = 'mobile-circle-container';
    
    // Define the circle data
    const circleData = [
        {
            id: 'mobile-card1',
            circleId: 'mobile-circle1',
            backgroundImage: '../src/assets/vertrauen.png',
            iconSrc: '../src/assets/certicificate.svg',
            iconAlt: 'Certificate',
            title: 'Vertraue auf Qualität!',
            text: 'Unsere Zahnzusatzversicherung gehört zu den besten in Deutschland – ausgezeichnet von Experten und empfohlen von zufriedenen Kunden. Profitiere von starken Leistungen für Deine Zahngesundheit und sichere Dich rundum ab!'
        },
        {
            id: 'mobile-card2',
            circleId: 'mobile-circle2',
            backgroundImage: '../src/assets/Smiling_2.png',
            iconSrc: '../src/assets/tooth.svg',
            iconAlt: 'Tooth',
            title: 'Hochwertiger Zahnersatz kann teuer werden',
            text: 'Mit unserer Zahnzusatzversicherung übernehmen wir bis zu 100 % der Kosten! Erhalte erstklassigen Schutz für Implantate, Kronen und Brücken zu einem fairen Preis. Sorgenfrei lächeln war noch nie so einfach!'
        },
        {
            id: 'mobile-card3',
            circleId: 'mobile-circle3',
            backgroundImage: '../src/assets/flexibilität.png',
            iconSrc: '../src/assets/contract.svg',
            iconAlt: 'Contract',
            title: 'Maximale Flexibilität für Dich!',
            text: 'Unsere Zahnzusatzversicherung ist täglich kündbar und kommt ohne versteckte Gebühren. Klare Leistungen, faire Beiträge – genau so, wie es sein sollte.'
        }
    ];
    
    // Create each mobile card
    circleData.forEach((data) => {
        // Create card element
        const mobileCard = document.createElement('div');
        mobileCard.className = 'mobile-card';
        mobileCard.id = data.id;
        
        // Create circle element
        const circle = document.createElement('div');
        circle.className = 'circle';
        circle.id = data.circleId;
        circle.style.backgroundImage = `url('${data.backgroundImage}')`;
        
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'circle-content-container';
        
        // Create icon
        const icon = document.createElement('img');
        icon.src = data.iconSrc;
        icon.alt = data.iconAlt;
        icon.className = 'circle-icon';
        
        // Create content
        const content = document.createElement('div');
        content.className = 'circle-content';
        content.innerHTML = `<strong>${data.title}</strong> ${data.text}`;
        
        // Assemble content container
        contentContainer.appendChild(icon);
        contentContainer.appendChild(content);
        
        // Assemble mobile card
        mobileCard.appendChild(circle);
        mobileCard.appendChild(contentContainer);
        
        // Add to container
        mobileCircleContainer.appendChild(mobileCard);
    });
    
    // Add the mobile circle container directly to the page instead of replacing accordion
    const scrollingCirclesSection = document.querySelector('.scrolling-circles');
    if (scrollingCirclesSection) {
        scrollingCirclesSection.after(mobileCircleContainer);
    } else {
        // Fallback - add to body
        document.body.appendChild(mobileCircleContainer);
    }
}

// Set up mobile circle cards with scroll-based blur effect
function setupMobileCircleCards() {
    // Get all mobile cards
    const mobileCards = document.querySelectorAll('.mobile-card');
    
    // If no mobile cards were found or created, exit the function
    if (mobileCards.length === 0) return;
    
    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // When a card comes into view
                if (entry.isIntersecting) {
                    // Add in-view class much faster
                    setTimeout(() => {
                        entry.target.classList.add('in-view');
                        
                        // Find the content container and add content-visible class faster
                        const contentContainer = entry.target.querySelector('.circle-content-container');
                        if (contentContainer) {
                            setTimeout(() => {
                                contentContainer.classList.add('content-visible');
                            }, 50); // Reduced delay for content visibility
                        }
                    }, 50); // Reduced delay for applying in-view effect
                } else {
                    // When card leaves viewport, remove the classes
                    entry.target.classList.remove('in-view');
                    const contentContainer = entry.target.querySelector('.circle-content-container');
                    if (contentContainer) {
                        contentContainer.classList.remove('content-visible');
                    }
                }
            });
        },
        { 
            threshold: 0.4, // Trigger when 40% is visible (sooner)
            rootMargin: '0px 0px' // Trigger closer to viewport edge
        }
    );
    
    // Observe all mobile cards
    mobileCards.forEach(card => {
        observer.observe(card);
    });
    
    // Create a simple entrance animation for the cards
    gsap.from('.mobile-card', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.25, // Increase stagger for better sequential effect
        ease: "power2.out"
    });
}

// Mobile text block animations
function setupMobileTextBlockAnimations() {
    // Animation for text blocks on mobile - simpler and faster than desktop version
    gsap.utils.toArray(['.text-block-left', '.text-block-right']).forEach((block, i) => {
        gsap.to(block, {
            scrollTrigger: {
                trigger: block,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: i * 0.15
        });
    });
}

// Hide navbar on scroll down, show on scroll up
function setupMobileNavbar() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            // Scrolling down & past the initial area
            navbar.classList.add('nav-hidden');
        } else {
            // Scrolling up
            navbar.classList.remove('nav-hidden');
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true }); // Improved performance with passive event
}

// Set up hamburger menu functionality
function setupHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const logo = document.querySelector('.logo');
    
    if (!hamburgerBtn || !mobileMenu) return;
    
    // Add click event to logo to navigate to home page
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Toggle menu on hamburger button click
    hamburgerBtn.addEventListener('click', function() {
        hamburgerBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        
        // Prevent body scrolling when menu is open
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    
    // Close menu when clicking anywhere in the menu area
    mobileMenu.addEventListener('click', function(e) {
        // Only close if clicking the menu background (not the links)
        if (e.target === mobileMenu) {
            hamburgerBtn.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when pressing escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            hamburgerBtn.classList.remove('open');
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    
    // Apply active state to current page link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Add PWA-specific features
function addPWAFeatures() {
    // Preload important images and resources
    const imageUrls = [
        '../src/assets/vertrauen.png',
        '../src/assets/Smiling_2.png',
        '../src/assets/flexibilität.png',
        '../src/assets/certicificate.svg',
        '../src/assets/tooth.svg',
        '../src/assets/contract.svg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
    
    // Add minimal service worker support if needed
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Register service worker in production
            if (window.location.hostname !== 'localhost' && 
                window.location.hostname !== '127.0.0.1') {
                navigator.serviceWorker.register('/service-worker.js')
                .catch(error => {
                    console.log('Service worker registration failed:', error);
                });
            }
        });
    }
    
    // Add minimal PWA install prompt handling
    let deferredPrompt;
    const installButton = document.createElement('button');
    installButton.style.display = 'none';
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
    });
}

// Function to set up FAQ section
function setupFAQSection() {
    // Get all FAQ question elements
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Remove any existing listeners to prevent duplicates (if function called multiple times)
    faqQuestions.forEach(question => {
        // Clone and replace to remove all listeners
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
    });
    
    // Get the updated elements after replacement
    const updatedQuestions = document.querySelectorAll('.faq-question');
    
    // Add click event to each FAQ question with more robust handling
    updatedQuestions.forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default actions
            e.stopPropagation(); // Stop event bubbling
            
            // Get the parent FAQ item
            const faqItem = this.parentElement;
            
            // Toggle active class on the FAQ item
            if (faqItem) {
                faqItem.classList.toggle('active');
                
                // For debugging - log to console
                console.log('FAQ item clicked:', faqItem);
            }
        });
        
        // Make it obvious this is clickable
        question.style.cursor = 'pointer';
    });
    
    // Add scroll animations for FAQ items (kept unchanged)
    gsap.utils.toArray('.faq-item').forEach((item, i) => {
        gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                end: "top 60%",
                toggleActions: "play none none none"
            }
        })
        .to(item, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: i * 0.2, // Stagger the animations
            ease: "power2.out"
        });
    });
}

// Function to set up text block animations
function setupTextBlockAnimations() {
    // Animation for Text Block 1 (left-aligned)
    gsap.timeline({
        scrollTrigger: {
            trigger: "#textBlock1",
            start: "top 80%",
            end: "top 50%",
            scrub: false, // Keep this non-scrubbed for simple fade-in
            toggleActions: "play none none none"
        }
    })
    .to("#textBlock1", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out"
    });

    // Animation for Text Block 2 (right-aligned)
    gsap.timeline({
        scrollTrigger: {
            trigger: "#textBlock2",
            start: "top 80%",
            end: "top 50%",
            scrub: false, // Keep this non-scrubbed
            toggleActions: "play none none none"
        }
    })
    .to("#textBlock2", {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3, // Slight delay after the first block
        ease: "power2.out"
    });
}

// Function to set up circle animations
function setupCircleAnimations() {
    // Animation for Circle 1 and its content
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle1-wrapper",
            start: "top 100%",
            end: "bottom 98%",
            scrub: 1,
            toggleActions: "play pause resume reset"
        }
    })
    .to(["#circle1", "#content1"], { // Animate circle and content together
        filter: "blur(0px)",
        opacity: 1, // Fade in completely
        duration: 1, // Duration relative to scroll distance
        ease: "none" // Linear ease for scrubbed animations
    }, 0); // Start immediately

    // Animation for Circle 2 and its content
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle2-wrapper",
            start: "top 100%",
            end: "bottom 98%",
            scrub: 1,
            toggleActions: "play pause resume reset"
        }
    })
    .to(["#circle2", "#content2"], {
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        ease: "none"
    }, 0);

    // Animation for Circle 3 and its content
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle3-wrapper",
            start: "top 120%",
            end: "bottom 98%",
            scrub: 1,
            toggleActions: "play pause resume reset"
        }
    })
    .to(["#circle3", "#content3"], {
        filter: "blur(0px)",
        opacity: 1,
        duration: 1,
        ease: "none"
    }, 0);
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

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("Document loaded for script.js");
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log("GSAP & ScrollTrigger OK");

        const isMobile = window.innerWidth <= 768;
        console.log("Is mobile:", isMobile);

        if (isMobile) {
            // Mobile-specific setups (excluding headline animation)
            setupMobileExperience(); 
        } else {
            // Desktop-specific setups (excluding headline animation)
            setupCircleAnimations();
            setupTextBlockAnimations();
        }
        // Common setups for both
        setupHeadlinePinningAnimation(); // Call this for both mobile and desktop
        setupFAQSection();
        setupChatPopup(); // Initialize chat popup logic

    } else {
        console.error("GSAP or ScrollTrigger not loaded!");
    }
});

// Debounced resize handler
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        console.log("Resizing, re-setting up animations...");
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
             const isMobile = window.innerWidth <= 768;
             // Clean up old triggers specifically for this animation
             ScrollTrigger.getById("headline-pin-trigger")?.kill();
             ScrollTrigger.getById("headline-section-pin-trigger")?.kill();
 
             if (isMobile) {
                 // Mobile-specific setups (excluding headline animation)
                 setupMobileExperience(); 
             } else {
                 // Desktop-specific setups (excluding headline animation)
                 setupCircleAnimations();
                 setupTextBlockAnimations();
             }
             // Common setups for both
             setupHeadlinePinningAnimation(); // Re-run this for both mobile and desktop
             setupFAQSection(); // Re-run FAQ setup
             setupChatPopup(); // Re-initialize chat popup logic

        } else {
            console.error("GSAP/ScrollTrigger missing on resize!");
        } 
    }, 250);
});

// --- Revised Headline Pinning Animation ---
function setupHeadlinePinningAnimation() {
    console.log("Setting up yPercent headline animation + simple text fade...");

    // Kill previous triggers
    ScrollTrigger.getById("headline-section-pin-trigger")?.kill();

    const headlines = document.querySelectorAll('.chat-style-headline');
    const textElements = document.querySelectorAll('.chat-style-text');
    const headlineSection = document.getElementById('scrollHeadlinesSection');

    if (!headlineSection || headlines.length < 3 || textElements.length < 3) {
        console.error("Required elements not found. Need at least 3 headlines and 3 text elements.");
        return;
    }

    const h1 = headlines[0]; 
    const h2 = headlines[1];
    const h3 = headlines[2];
    const text1 = textElements[0];
    const text2 = textElements[1];
    const text3 = textElements[2];

    // Determine initial Y offset based on screen width
    const isMobile = window.innerWidth <= 768;
    // Set the same initial offset for consistency after desktop headline adjustment
    const initialTextY = -180; 
    
    // Determine final headline Y positions based on screen width
    const finalHeadlineYPercent = isMobile ? -950 : -550; // User's adjusted desktop value

    // Reset positions/styles
    gsap.set([h1, h2, h3], { yPercent: 0 }); 
    // Set initial opacity to 0 and conditional vertical offset
    gsap.set([text1, text2, text3], { y: initialTextY, opacity: 0 }); 

    // Create the animation timeline
    const animationTimeline = gsap.timeline({ paused: true });
    
    const headlineMoveDuration = 0.4; // Conceptual duration within the timeline for movement
    const textFadeDuration = 0.3;     // Duration for text fade in/out
    const textVisibleDuration = 0.5;  // How long text stays visible
    const delayAfterHMove = 0.05;     // Small delay between headline move end and text fade in start
    const delayAfterTFadeOut = 0.1; // Small delay between text fade out end and next headline move start

    let currentTime = 0;

    // --- Section 1: H1 & T1 --- 
    // H1 moves up
    animationTimeline.to(h1, {
        yPercent: finalHeadlineYPercent, // Use conditional value
        ease: "none",
        duration: headlineMoveDuration
    }, currentTime);
    const h1MoveEnd = currentTime + headlineMoveDuration;

    // T1 fades in (starts AFTER H1 move ends)
    const t1FadeInStart = h1MoveEnd + delayAfterHMove; 
    animationTimeline.to(text1, {
        opacity: 1,
        duration: textFadeDuration,
        ease: "power1.inOut"
    }, t1FadeInStart);
    const t1FadeInEnd = t1FadeInStart + textFadeDuration;

    // T1 fades out
    const t1FadeOutStart = t1FadeInEnd + textVisibleDuration;
    animationTimeline.to(text1, {
        opacity: 0,
        duration: textFadeDuration,
        ease: "power1.inOut"
    }, t1FadeOutStart);
    const t1FadeOutEnd = t1FadeOutStart + textFadeDuration;
    
    // Update time for next section start
    currentTime = t1FadeOutEnd + delayAfterTFadeOut; 

    // --- Section 2: H2 & T2 --- 
    // H2 moves up
    animationTimeline.to(h2, {
        yPercent: finalHeadlineYPercent, // Use conditional value
        ease: "none",
        duration: headlineMoveDuration
    }, currentTime);
    const h2MoveEnd = currentTime + headlineMoveDuration;

    // T2 fades in (starts AFTER H2 move ends)
    const t2FadeInStart = h2MoveEnd + delayAfterHMove;
    animationTimeline.to(text2, {
        opacity: 1,
        duration: textFadeDuration,
        ease: "power1.inOut"
    }, t2FadeInStart);
    const t2FadeInEnd = t2FadeInStart + textFadeDuration;

    // T2 fades out
    const t2FadeOutStart = t2FadeInEnd + textVisibleDuration;
    animationTimeline.to(text2, {
        opacity: 0,
        duration: textFadeDuration,
        ease: "power1.inOut"
    }, t2FadeOutStart);
    const t2FadeOutEnd = t2FadeOutStart + textFadeDuration;
    
    // Update time for next section start
    currentTime = t2FadeOutEnd + delayAfterTFadeOut; 

    // --- Section 3: H3 & T3 --- 
    // H3 moves up
    animationTimeline.to(h3, {
        yPercent: finalHeadlineYPercent, // Use conditional value
        ease: "none",
        duration: headlineMoveDuration
    }, currentTime);
    const h3MoveEnd = currentTime + headlineMoveDuration;

    // T3 fades in (starts AFTER H3 move ends)
    const t3FadeInStart = h3MoveEnd + delayAfterHMove; 
    animationTimeline.to(text3, {
        opacity: 1,
        duration: textFadeDuration,
        ease: "power1.inOut"
    }, t3FadeInStart);
    const t3FadeInEnd = t3FadeInStart + textFadeDuration;

    // T3 fades out
    const t3FadeOutStart = t3FadeInEnd + textVisibleDuration;
    animationTimeline.to(text3, {
        opacity: 0,
        duration: textFadeDuration,
        ease: "power1.inOut"
    }, t3FadeOutStart);
    // const t3FadeOutEnd = t3FadeOutStart + textFadeDuration; // End of sequence

    // Create the main ScrollTrigger (controls the whole timeline)
    ScrollTrigger.create({
        trigger: headlineSection,
        animation: animationTimeline, 
        start: "center 85%", // Changed from "center center" to position headlines lower on the screen
        end: "+=1500", // Reduced scroll distance to make animation pin earlier to bottom      
        pin: true,             
        pinSpacing: true,      
        scrub: 1,              
        id: "headline-section-pin-trigger",
        markers: false,        
        invalidateOnRefresh: true
    });
}

// --- START: Chat Popup Logic ---
function setupChatPopup() {
   const openButton = document.getElementById('openChatButton');
   const popupWrapper = document.getElementById('chat-popup-wrapper');
   const closeButton = document.getElementById('closeChatPopup');

   if (!openButton) return; // Exit if the main trigger button isn't found

   openButton.addEventListener('click', () => {
       const isMobile = window.innerWidth <= 768;
       console.log("Open chat button clicked. Is mobile:", isMobile);
       if (isMobile) {
           // Trigger existing mobile chat logic
           if (typeof mobileChatSetState === 'function') {
               mobileChatSetState('state-open');
               console.log("Triggered mobile chat state: open");
           } else {
               console.error("mobileChatSetState function not found!");
           }
       } else {
           // Show desktop popup
           if (popupWrapper) {
               popupWrapper.style.display = 'flex';
               // Reset position to center before showing
               const chatContainerToReset = popupWrapper.querySelector('.chat-container');
               if (chatContainerToReset) {
                   chatContainerToReset.style.transform = ''; // Reset transform
                   chatContainerToReset.removeAttribute('data-x'); // Remove position data
                   chatContainerToReset.removeAttribute('data-y');
               }
               console.log("Opened desktop chat popup");
                // Focus input field when opened
                const inputField = popupWrapper.querySelector(".chat-input-field");
                if(inputField) {
                    setTimeout(() => inputField.focus(), 50);
                }
           } else {
               console.error("Desktop chat popup wrapper not found!");
           }
       }
   });

   // Desktop close button
   if (closeButton) {
       closeButton.addEventListener('click', () => {
           if (popupWrapper) {
               popupWrapper.style.display = 'none';
               console.log("Closed desktop chat popup via button");
           }
       });
   }

   // Desktop close by clicking overlay
   if (popupWrapper) {
       popupWrapper.addEventListener('click', (event) => {
           // Close only if clicked directly on the wrapper (overlay)
           if (event.target === popupWrapper) {
               popupWrapper.style.display = 'none';
               console.log("Closed desktop chat popup via overlay click");
           }
       });
   }

   // --- Add Drag Functionality (Desktop Popup) ---
   const chatContainer = popupWrapper ? popupWrapper.querySelector('.chat-container') : null;

   if (chatContainer && typeof interact !== 'undefined') {
       interact(chatContainer)
           .draggable({
               inertia: true,
               modifiers: [
                   interact.modifiers.restrictRect({
                       restriction: 'parent', // Restrict dragging within the popup wrapper (overlay)
                       endOnly: true
                   })
               ],
               autoScroll: false,
               listeners: {
                   move(event) {
                       const target = event.target;
                       // Keep the dragged position in the data-x/data-y attributes
                       let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                       let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                       // Translate the element
                       target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

                       // Update the position attributes
                       target.setAttribute('data-x', x);
                       target.setAttribute('data-y', y);
                   }
               }
           })
           .on('dragstart', function (event) {
               // Optional: Add a class for visual feedback during drag
               event.target.style.transition = 'none'; // Disable transitions during drag
           })
           .on('dragend', function (event) {
               event.target.style.transition = ''; // Re-enable transitions after drag
           });
       console.log("Interact.js initialized for desktop chat popup dragging.");
   } else if (!chatContainer) {
       console.warn("Chat container not found for drag initialization.");
   } else {
       console.warn("Interact.js not loaded. Dragging for desktop chat popup will not work.");
   }
   // --- End Drag Functionality ---
}
// --- END: Chat Popup Logic ---