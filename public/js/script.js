// Navbar Component - Reusable across all pages
let mobileChatSetState = () => { console.warn('mobileChatSetState not initialized or not in mobile context'); };

function createNavbar() {
    return `
        <nav class="navbar">
            <div class="logo-container">
                <a href="index.html">
                    <img src="assets/smilecare_logo.png" alt="SmileCare24 Logo" class="logo">
                </a>
                <img src="assets/logo_barmenia.png" alt="Barmenia Logo" class="logo-barmenia">
            </div>
            <button class="hamburger-btn mobile-only" id="hamburger-btn">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div class="mobile-menu mobile-only" id="mobile-menu">
                <div class="menu-links">
                    <a href="index.html" class="menu-link">Startseite</a>
                    <a href="tarifrechner.html" class="menu-link">Tarifrechner</a>
                    <a href="impressum.html" class="menu-link">Impressum</a>
                    <a href="datenschutz.html" class="menu-link">Datenschutz</a>
                </div>
            </div>
            <button class="calendly-button" id="calendlyButton" type="button">
                <span class="calendly-button-text">Kostenlos Termin vereinbaren</span>
                <svg class="calendly-button-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
            </button>
        </nav>
    `;
}

// Function to inject navbar and set up its functionality
function initializeNavbar() {
    // Find navbar placeholder or create one
    let navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        // If no container exists, create one at the beginning of body
        navbarContainer = document.createElement('div');
        navbarContainer.id = 'navbar-container';
        document.body.insertBefore(navbarContainer, document.body.firstChild);
    }
    
    // Inject navbar HTML
    navbarContainer.innerHTML = createNavbar();
    
    // Set up hamburger menu functionality
    setupHamburgerMenu();
    
    // Set up active menu item based on current page
    setActiveMenuItem();
}

// Function to set active menu item based on current page
function setActiveMenuItem() {
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

history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", function () {
    // Initialize navbar component first
    initializeNavbar();
    initializeCookieConsent(); // Added cookie consent initialization
    
    // Ensure page loads scrolled to the top (can be re-asserted here or rely on above)
    window.scrollTo(0, 0); 

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
        setupTextBlockAnimations();
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
            window.location.reload(); // This will also ensure scroll to top on reload due to new page load
        }
    });
});

// Function to initialize Cookie Consent Banner
function initializeCookieConsent() {
    const consentBanner = document.getElementById('cookieConsentBanner');
    const acceptAllButton = document.getElementById('acceptAllCookies');
    const acceptNecessaryButton = document.getElementById('acceptNecessaryCookies');

    if (!consentBanner) {
        console.warn('Cookie consent banner (cookieConsentBanner) not found. Skipping initialization.');
        return;
    }

    if (!acceptAllButton || !acceptNecessaryButton) {
        console.warn('One or more cookie consent buttons not found (acceptAllCookies or acceptNecessaryCookies). Cookie banner functionality might be incomplete.');
        // Depending on requirements, may not want to return here, but log is important.
    }

    // Always make the banner pop up when the site loads.
    // The banner will hide when a button is clicked.
    // On subsequent page loads, it will reappear.
    consentBanner.classList.add('show');

    if (acceptAllButton) {
        acceptAllButton.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'all');
            consentBanner.classList.remove('show');
            // Optional: transition end handling to set display: none if needed
        });
    }

    if (acceptNecessaryButton) {
        acceptNecessaryButton.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'necessary');
            consentBanner.classList.remove('show');
            // Optional: transition end handling
        });
    }
}

// Mobile experience setup
function setupMobileExperience() {

    
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
    const ctaButton = document.getElementById('chat-cta-button');
    const minimizedBubble = document.getElementById('chat-minimized-bubble');
    const chatWindow = document.getElementById('chat-window');
    const minimizeChatButton = document.getElementById('minimize-chat');
    const mobileChatInput = document.getElementById('mobile-chat-input');
    const mobileSendButton = document.getElementById('mobile-send-button');
    const dropZone = document.getElementById('drop-zone');
    const mobileChatArea = document.getElementById('mobile-chat-area');

    if (!chatWidgetContainer || !ctaButton || !minimizedBubble || !chatWindow || !minimizeChatButton || !mobileChatInput || !mobileSendButton || !dropZone || !mobileChatArea) {
        console.warn("One or more mobile chat DOM elements not found. Skipping mobile experience setup.");
        return;
    }

    let isDragging = false; // Initialize isDragging here

    // Initial state setup
    chatWidgetContainer.classList.remove('state-initial', 'state-open', 'state-minimized-bubble');
    chatWidgetContainer.classList.add('state-minimized-bubble'); // Default to minimized bubble

    // --- State Management ---
    const states = ['initial', 'open', 'minimized-bubble'];

    // --- Event Listeners ---
    ctaButton.addEventListener('click', () => {
        setState('state-open');
    });

    minimizedBubble.addEventListener('click', () => {
         if (!isDragging) {
            setState('state-open');
        }
        setTimeout(() => isDragging = false, 0);
    });

    minimizeChatButton.addEventListener('click', () => {
        setState('state-minimized-bubble');
    });

    mobileSendButton.addEventListener('click', sendMobileMessage);
    mobileChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMobileMessage();
        }
    });

    // --- Functions ---
    function setState(newState) {
        const currentState = getCurrentState();
        if (currentState === newState) return;

        if (newState === 'state-minimized-bubble' && minimizedBubble.classList.contains('dropped')) {
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
             minimizedBubble.classList.remove('dropped');
             mobileChatInput.focus(); // Focus input when opening
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
        minimizedBubble.style.transform = '';
        minimizedBubble.classList.remove('dropped');
    }

    async function sendMobileMessage() {
        console.log("sendMobileMessage called");
        const userInput = document.getElementById('mobile-chat-input'); // Corrected ID
        if (!userInput) {
            console.error("#mobile-chat-input not found!");
            return;
        }
        const messageContent = userInput.value.trim(); 
        if (messageContent === "") return;

        const chatBox = document.getElementById('mobile-chat-area'); // Corrected ID
        if (!chatBox) {
            console.error("#mobile-chat-area not found!");
            return;
        }

        // Append user message
        // const userMessage = document.createElement('div'); // Using displayMessage now
        // userMessage.classList.add('message', 'sent');
        // userMessage.textContent = messageContent; 
        // chatBox.appendChild(userMessage);
        displayMessage(messageContent, 'sent', chatBox); // Use global displayMessage
        // chatBox.scrollTop = chatBox.scrollHeight; // displayMessage handles scrolling

        // Clear input
        userInput.value = "";

        // Show loading circle
        // const loadingMessage = document.createElement("div"); // Using displayMessage now
        // loadingMessage.classList.add("message", "received");
        // const loadingCircle = document.createElement("div");
        // loadingCircle.classList.add("loading-circle");
        // loadingMessage.appendChild(loadingCircle);
        // chatBox.appendChild(loadingMessage);
        // chatBox.scrollTop = chatBox.scrollHeight;
        const loadingElement = displayMessage('', 'loading', chatBox); // Use global displayMessage

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageContent })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Remove loading circle
            // chatBox.removeChild(loadingMessage);
            if (loadingElement && chatBox.contains(loadingElement)) {
                chatBox.removeChild(loadingElement);
            }
            
            // Display AI response using typewriter
            // const aiResponseDiv = document.createElement('div'); // Using displayMessage now
            // aiResponseDiv.classList.add('message', 'received');
            // chatBox.appendChild(aiResponseDiv);
            // typeWriter(aiResponseDiv, data.reply, 30, chatBox);
            displayMessage(data.reply, 'received', chatBox, true); // Use global displayMessage, true for typewriter
            
        } catch (error) {
            console.error('Error:', error);
            
            // Remove loading circle if there was an error
            // if (chatBox.contains(loadingMessage)) {
            //     chatBox.removeChild(loadingMessage);
            // }
            if (loadingElement && chatBox.contains(loadingElement)) {
                chatBox.removeChild(loadingElement);
            }
            
            // Display error message
            // const errorMessage = document.createElement('div'); // Using displayMessage now
            // errorMessage.classList.add('message', 'received');
            // errorMessage.textContent = "Fehler: AI ist nicht erreichbar. Bitte versuche es später erneut.";
            // errorMessage.style.color = "red";
            // chatBox.appendChild(errorMessage);
            // chatBox.scrollTop = chatBox.scrollHeight;
            displayMessage("Fehler: AI ist nicht erreichbar. Bitte versuche es später erneut.", 'received', chatBox);
        }
    }

    function scrollToBottom() {
        // Small delay to ensure DOM update before scrolling
        setTimeout(() => {
            mobileChatArea.scrollTop = mobileChatArea.scrollHeight;
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
                        minimizedBubble.style.transition = 'none';
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
                        minimizedBubble.style.transition = '';

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
                            minimizedBubble.classList.add('dropped');
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
    const navbarHeight = navbar ? navbar.offsetHeight : 60; // Get navbar height, fallback to 60
    let isNavbarHidden = false;
    const scrollThreshold = 5; // Minimum scroll distance to trigger navbar hide/show

    if (!navbar) return;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (Math.abs(scrollTop - lastScrollTop) <= scrollThreshold) {
            return; // Not scrolled enough
        }

        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
            // Scrolling down & past the initial navbar position
            if (!isNavbarHidden) {
                navbar.style.transform = `translateY(-${navbarHeight}px)`;
                isNavbarHidden = true;
            }
        } else {
            // Scrolling up or at the top
            if (isNavbarHidden) {
                navbar.style.transform = 'translateY(0)';
                isNavbarHidden = false;
            }
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }, { passive: true });
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
    // Preload key assets for PWA experience
    const imagesToPreload = [
        'assets/vertrauen.png',
        'assets/Smiling_2.png',
        'assets/flexibilität.png',
        'assets/certicificate.svg',
        'assets/tooth.svg',
        'assets/contract.svg'
        // Add other critical assets here if needed
    ];
    
    imagesToPreload.forEach(url => {
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



// Helper function for typewriter effect
function typeWriter(element, text, speed = 30, chatBoxToScroll) { // speed in milliseconds
    let i = 0;
    element.innerHTML = ""; // Clear previous content if any

    // Check if the text contains an HTML table
    if (text.includes("<table")) {
        element.innerHTML = text; // Render table directly
        if (chatBoxToScroll) {
            chatBoxToScroll.scrollTop = chatBoxToScroll.scrollHeight;
        }
        return; // Skip typewriter effect for messages containing tables
    }

    function type() {
        if (i < text.length) {
            // If the text is HTML, we need to be careful not to break tags
            // This is a simplified version; a robust HTML parser might be needed for complex HTML
            let char = text.charAt(i);
            if (char === '<') { // If it\'s an HTML tag, append until '>'
                let tagEnd = text.indexOf('>', i);
                if (tagEnd !== -1) {
                    element.innerHTML += text.substring(i, tagEnd + 1);
                    i = tagEnd;
                } else { // Malformed tag, append char by char
                    element.innerHTML += char;
                }
            } else {
                element.innerHTML += char;
            }
            i++;
            if (chatBoxToScroll) {
                 chatBoxToScroll.scrollTop = chatBoxToScroll.scrollHeight; // Keep scrolling to bottom
            }
            setTimeout(type, speed);
        }
    }
    type();
}

// Global function to display messages in chat (for both mobile and desktop)
function displayMessage(content, type, chatBoxElement, useTypewriter = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type); // 'sent', 'received', or 'loading'
    messageDiv.style.textAlign = 'left'; // Ensure text is left-aligned within the bubble

    if (type === 'loading') {
        const loadingIndicator = document.createElement('div');
        // Use the 3-dot loading indicator style from CSS
        loadingIndicator.classList.add('loading-indicator'); 
        for (let i = 0; i < 3; i++) {
            loadingIndicator.appendChild(document.createElement('span'));
        }
        messageDiv.appendChild(loadingIndicator);
        messageDiv.classList.add('received'); // So it aligns left like AI messages
    } else if (type === 'sent') {
        messageDiv.textContent = content; // Use textContent for user messages to prevent XSS
        messageDiv.style.backgroundColor = '#034848'; // Primary color
        messageDiv.style.color = 'white';
        messageDiv.style.alignSelf = 'flex-end';
        messageDiv.style.borderBottomRightRadius = '5px'; // Less rounded on one side
    } else if (type === 'received') {
        messageDiv.style.backgroundColor = 'transparent'; // Transparent background
        messageDiv.style.color = '#333'; // Dark grey text for readability
        messageDiv.style.border = 'none'; // No border
        messageDiv.style.alignSelf = 'flex-start';
        // messageDiv.style.borderBottomLeftRadius = '5px';

        if (useTypewriter && chatBoxElement) {
            const textSpan = document.createElement('span');
            messageDiv.appendChild(textSpan);
            typeWriter(textSpan, content, 30, chatBoxElement);
        } else {
            messageDiv.innerHTML = content; // Use innerHTML for AI messages to render tables/HTML
        }
    }

    chatBoxElement.appendChild(messageDiv);
    // Scroll to bottom smoothly after a short delay to allow rendering
    setTimeout(() => {
        chatBoxElement.scrollTo({
            top: chatBoxElement.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    return messageDiv; // Return the created message element (useful for removing loading indicators)
}

// New async sendMessage function to handle API calls
async function sendMessage() {
    const inputField = document.querySelector(".chat-input-field");
    const messageContent = inputField.innerText.trim(); // Use innerText for contenteditable
    if (messageContent === "") return;

    const chatBox = document.getElementById("chat-box");

    // Append user message
    const userMessage = document.createElement("div");
    userMessage.classList.add("chat-message", "user-message");
    userMessage.textContent = messageContent; // Use textContent for security if message is just text
    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Reset input field
    inputField.innerHTML = ""; // Clear contenteditable
    inputField.style.height = "auto"; // Reset height for autoExpand
    const newHeight = Math.min(inputField.scrollHeight, 120);
    inputField.style.height = newHeight + "px"; 
    inputField.style.overflowY = inputField.scrollHeight > 120 ? "auto" : "hidden";

    // Show loading circle
    const loadingMessage = document.createElement("div");
    loadingMessage.classList.add("chat-message", "ai-message");
    const loadingCircle = document.createElement("div");
    loadingCircle.classList.add("loading-circle");
    loadingMessage.appendChild(loadingCircle);
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // Send message to server
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: messageContent })
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Remove loading circle
        chatBox.removeChild(loadingMessage);
        
        // Display AI response using typewriter
        const aiResponseDiv = document.createElement("div");
        // Ensure this class matches your AI message styling (no bubble)
        // It should be "ai-message" if your CSS targets that for no-bubble style.
        // If .chat-message.ai-message is used, ensure that combination doesn't add a bubble.
        aiResponseDiv.classList.add("chat-message", "ai-message"); 
        chatBox.appendChild(aiResponseDiv);
        typeWriter(aiResponseDiv, data.reply, 30, chatBox); // Use chatBox for scrolling
        
    } catch (error) {
        console.error('Error:', error);
        
        // Remove loading circle if there was an error
        if (chatBox.contains(loadingMessage)) {
            chatBox.removeChild(loadingMessage);
        }
        
        // Display error message
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("chat-message", "ai-message", "error-message");
        errorMessage.textContent = "Fehler: AI ist nicht erreichbar. Bitte versuche es später erneut.";
        errorMessage.style.color = "red";
        chatBox.appendChild(errorMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Add CSS for typing animation (This is for the old dot indicator, can be removed if not used elsewhere)
// const typingStyle = document.createElement('style');
// typingStyle.textContent = `
//    @keyframes blink {
//        0%, 100% { opacity: 0.2; }
//        50% { opacity: 1; }
//    }
// `;
// document.head.appendChild(typingStyle);

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
            setupTextBlockAnimations();
        }
        // Common setups for both
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
             // Clean up old triggers
 
             if (isMobile) {
                 // Mobile-specific setups (excluding headline animation)
                 setupMobileExperience(); 
             } else {
                 // Desktop-specific setups (excluding headline animation)
                 setupTextBlockAnimations();
             }
             // Common setups for both
             setupFAQSection(); // Re-run FAQ setup
             setupChatPopup(); // Re-initialize chat popup logic

        } else {
            console.error("GSAP/ScrollTrigger missing on resize!");
        } 
    }, 250);
});



// --- START: Chat Popup Logic ---
function setupChatPopup() {
   console.log("setupChatPopup: Attempting to find #chat-popup-wrapper. Element present in DOM:", document.getElementById('chat-popup-wrapper')); // Added log
   const openButton = document.getElementById('openChatButton') || document.getElementById('openChatButtonAlternate');
   const openButtonAlternate = document.getElementById('openChatButtonAlternate');
   const popupWrapper = document.getElementById('chat-popup-wrapper');
   const closeButton = document.getElementById('closeChatPopup');

   // Comprehensive debugging function
   function debugChatInput() {
       console.log("=== CHAT INPUT DEBUG ===");
       const inputField = popupWrapper.querySelector(".chat-input-field");
       const inputContainer = popupWrapper.querySelector(".chat-input");
       const inputContainerParent = popupWrapper.querySelector(".chat-input-container");
       
       if (inputField) {
           console.log("Input field found:", inputField);
           console.log("Input field computed styles:", {
               display: getComputedStyle(inputField).display,
               pointerEvents: getComputedStyle(inputField).pointerEvents,
               userSelect: getComputedStyle(inputField).userSelect,
               cursor: getComputedStyle(inputField).cursor,
               zIndex: getComputedStyle(inputField).zIndex,
               position: getComputedStyle(inputField).position,
               opacity: getComputedStyle(inputField).opacity,
               visibility: getComputedStyle(inputField).visibility
           });
           console.log("Input field properties:", {
               contentEditable: inputField.contentEditable,
               isContentEditable: inputField.isContentEditable,
               tabIndex: inputField.tabIndex,
               disabled: inputField.disabled,
               readonly: inputField.readOnly
           });
           
           // Test if the input field can receive focus
           console.log("Attempting to focus input field...");
           inputField.focus();
           console.log("Active element after focus attempt:", document.activeElement);
           console.log("Is input field focused?", document.activeElement === inputField);
       } else {
           console.error("Input field not found!");
       }
       
       if (inputContainer) {
           console.log("Input container styles:", {
               pointerEvents: getComputedStyle(inputContainer).pointerEvents,
               cursor: getComputedStyle(inputContainer).cursor,
               zIndex: getComputedStyle(inputContainer).zIndex
           });
       }
       
       if (inputContainerParent) {
           console.log("Input container parent styles:", {
               pointerEvents: getComputedStyle(inputContainerParent).pointerEvents,
               cursor: getComputedStyle(inputContainerParent).cursor,
               zIndex: getComputedStyle(inputContainerParent).zIndex
           });
       }
       console.log("=== END DEBUG ===");
   }

   // Function to handle opening the chat
   const openChatHandler = () => {
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
               
               // Auto-focus input field when opened
                const inputField = popupWrapper.querySelector(".chat-input-field");
                if(inputField) {
                   // Ensure the field is properly set up for text input
                   inputField.contentEditable = "true";
                   inputField.setAttribute("contenteditable", "true");
                   inputField.setAttribute("role", "textbox");
                   inputField.setAttribute("aria-multiline", "true");

                   // Attempt to blur first, in case something else has focus
                   try {
                       if (document.activeElement && typeof document.activeElement.blur === 'function') {
                           // document.activeElement.blur(); // Temporarily disable explicit blur of activeElement
                       }
                       inputField.blur(); // Blur the input field itself
                       console.log("Attempted to blur input field before focusing.");
                   } catch (e) {
                       console.warn("Error trying to blur input field:", e);
                   }
                   
                   // Focus using nested requestAnimationFrame for better timing
                   requestAnimationFrame(() => {
                       requestAnimationFrame(() => {
                           inputField.focus();

                           // Force a reflow/repaint which might help with rendering glitches
                           const _ = inputField.offsetHeight; 
                           console.log("Forced reflow by reading offsetHeight: ", _);
                           
                           // Set cursor at the end of content if there's any text
                           const range = document.createRange();
                           const selection = window.getSelection();
                           if (selection) { // Check if selection is not null
                               range.selectNodeContents(inputField);
                               range.collapse(false); // false to collapse to the end
                               selection.removeAllRanges();
                               selection.addRange(range);
                           }
                           
                           console.log("Auto-focused chat input field in openChatHandler using nested requestAnimationFrame");
                           
                           // Run debug, also in a requestAnimationFrame to ensure it runs after focus attempt
                           requestAnimationFrame(debugChatInput); 
                       });
                   });
                }
           } else {
               console.error("Desktop chat popup wrapper not found!");
           }
       }
   };

   if (openButton) {
       openButton.addEventListener('click', openChatHandler);
   }

   if (openButtonAlternate) { // Add listener for the alternate button
       openButtonAlternate.addEventListener('click', openChatHandler);
   }

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

   // --- Set up event listeners for popup chat input ---
   if (popupWrapper) {
       const popupInputField = popupWrapper.querySelector(".chat-input-field");
       const popupSendButton = popupWrapper.querySelector("#enter-button");
       const popupInputContainer = popupWrapper.querySelector(".chat-input");

       if (popupInputField) {
           // Ensure the input field is properly configured for text input
           popupInputField.contentEditable = "true";
           popupInputField.setAttribute("contenteditable", "true");
           popupInputField.setAttribute("role", "textbox");
           popupInputField.setAttribute("aria-multiline", "true");
           
           // Add click handler to the input container to focus the field when clicked anywhere
           if (popupInputContainer) {
               popupInputContainer.addEventListener("click", function(event) {
                   console.log("Chat input container clicked - focusing input field");
                   event.stopPropagation();
                   popupInputField.focus();
               });
           }

           // Add explicit click handler to ensure the input field responds to clicks
           popupInputField.addEventListener("click", function(event) {
               console.log("Chat input field clicked - attempting to focus");
               event.stopPropagation(); // Prevent event bubbling
               popupInputField.focus();
           });

           // Add explicit focus handler
           popupInputField.addEventListener("focus", function(event) {
               console.log("Chat input field focused successfully");
               
               // Debug: Check all relevant properties
               console.log("Input field properties:", {
                   contentEditable: popupInputField.contentEditable,
                   isContentEditable: popupInputField.isContentEditable,
                   style: popupInputField.style.cssText,
                   tabIndex: popupInputField.tabIndex,
                   disabled: popupInputField.disabled,
                   readonly: popupInputField.readOnly
               });
               
               // Ensure cursor is visible and positioned at the end
               const range = document.createRange();
               const selection = window.getSelection();
               range.selectNodeContents(popupInputField);
               range.collapse(false);
               selection.removeAllRanges();
               selection.addRange(range);
           });

           // Add blur handler for debugging
           popupInputField.addEventListener("blur", function(event) {
               console.log("Chat input field lost focus");
           });

           // Add input event handler to track text input
           popupInputField.addEventListener("input", function(event) {
               console.log("Text input detected:", popupInputField.innerText);
               autoExpandPopup();
           });

           // Add additional keyboard event handlers
           popupInputField.addEventListener("keypress", function(event) {
               console.log("Key pressed:", event.key, "in chat input");
           });

           // Listen for keydown events on the popup's contenteditable div
           popupInputField.addEventListener("keydown", function (event) {
               console.log("Key down:", event.key, "in chat input");
               if (event.key === "Enter") {
                   if (event.shiftKey) {
                       // Allow new line with Shift+Enter
                       document.execCommand('insertLineBreak');
                       event.preventDefault();
                   } else {
                       event.preventDefault();
                       sendPopupMessage();
                   }
               }
           });

           // Auto-expand functionality for popup input
           function autoExpandPopup() {
               popupInputField.style.height = "auto"; 
               const newHeight = Math.min(popupInputField.scrollHeight, 120);
               popupInputField.style.height = newHeight + "px"; 
               popupInputField.style.overflowY = popupInputField.scrollHeight > 120 ? "auto" : "hidden";
           }

           // Initial setup
           autoExpandPopup();
       }

       if (popupSendButton) {
           popupSendButton.addEventListener("click", sendPopupMessage);
       }
   }

   // Function to send message from popup chat
   async function sendPopupMessage() {
       const popupInputField = popupWrapper.querySelector(".chat-input-field");
       const messageContent = popupInputField.innerText.trim();
       if (messageContent === "") return;

       const chatBox = popupWrapper.querySelector("#chat-box");

       // Append user message
       const userMessage = document.createElement("div");
       userMessage.classList.add("chat-message", "user-message");
       userMessage.textContent = messageContent;
       chatBox.appendChild(userMessage);
       chatBox.scrollTop = chatBox.scrollHeight;

       // Reset input field
       popupInputField.innerHTML = "";
       popupInputField.style.height = "auto";
       const newHeight = Math.min(popupInputField.scrollHeight, 120);
       popupInputField.style.height = newHeight + "px"; 
       popupInputField.style.overflowY = popupInputField.scrollHeight > 120 ? "auto" : "hidden";

       // Show loading circle
       const loadingElement = displayMessage('', 'loading', chatBox); // Use global displayMessage

       try {
           // Send message to server
           const response = await fetch("/chat", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ message: messageContent })
           });
           
           if (!response.ok) {
               throw new Error('Network response was not ok');
           }
           
           const data = await response.json();
           
           // Remove loading circle
           if (loadingElement && chatBox.contains(loadingElement)) {
               chatBox.removeChild(loadingElement);
           }
           
           // Display AI response using typewriter
           displayMessage(data.reply, 'received', chatBox, true); // Use global displayMessage, true for typewriter
           
       } catch (error) {
           console.error('Error:', error);
           
           // Remove loading circle if there was an error
           if (loadingElement && chatBox.contains(loadingElement)) {
               chatBox.removeChild(loadingElement);
           }
           
           // Display error message
           displayMessage("Fehler: AI ist nicht erreichbar. Bitte versuche es später erneut.", 'received', chatBox);
       }
   }

   // --- Add Drag Functionality (Desktop Popup) ---
   const chatContainer = popupWrapper ? popupWrapper.querySelector('.chat-container') : null;

   if (chatContainer && typeof interact !== 'undefined') {
       // Temporarily disable dragging functionality for testing
       // interact(chatContainer)
       //     .draggable({
       //         // Only allow dragging from the header area
       //         allowFrom: '.chat-header',
       //         // Prevent dragging from input area
       //         ignoreFrom: '.chat-input-container, .chat-input-field, .chat-send-btn',
       //         inertia: true,
       //         modifiers: [
       //             interact.modifiers.restrictRect({
       //                 restriction: 'parent', // Restrict dragging within the popup wrapper (overlay)
       //                 endOnly: true
       //             })
       //         ],
       //         autoScroll: false,
       //         listeners: {
       //             move(event) {
       //                 const target = event.target;
       //                 // Keep the dragged position
       //                 const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
       //                 const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
       //                 
       //                 // Translate the element
       //                 target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
       //                 // Update the position attributes
       //                 target.setAttribute('data-x', x);
       //                 target.setAttribute('data-y', y);
       //             }
       //         }
       //     });
   } else if (!chatContainer) {
       console.warn("Chat container not found for drag initialization.");
   } else {
       console.warn("Interact.js not loaded. Dragging for desktop chat popup will not work.");
   }
   // --- End Drag Functionality ---
}
// --- END: Chat Popup Logic ---