document.addEventListener("DOMContentLoaded", function () {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    
    // Check if user is on mobile
    const isMobile = window.innerWidth <= 768;
    
    // Set up the appropriate animations based on device
    if (isMobile) {
        setupMobileExperience();
    } else {
        // Desktop experience
        setupCircleAnimations();
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
            window.location.reload();
        }
    });
});

// Mobile experience setup
function setupMobileExperience() {
    // Set up mobile flip cards
    setupMobileCircleCards();
    
    // Set up mobile text block animations
    setupMobileTextBlockAnimations();
    
    // Hide navbar on scroll down, show on scroll up
    setupMobileNavbar();
    
    // Set up hamburger menu
    setupHamburgerMenu();
    
    // Add PWA-specific enhancements
    addPWAFeatures();
}

// Set up mobile flip cards
function setupMobileCircleCards() {
    // Get all mobile cards
    const mobileCards = document.querySelectorAll('.mobile-card');
    
    // Remove the click events that toggle flipping
    mobileCards.forEach(card => {
        // Remove any existing listeners by cloning and replacing the node
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
    });
    
    // Get the updated list of cards after replacing them
    const updatedCards = document.querySelectorAll('.mobile-card');
    
    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // When a card comes into view
                if (entry.isIntersecting) {
                    // Add in-view class with a slight delay to allow user to see the unblurred circle first
                    setTimeout(() => {
                        entry.target.classList.add('in-view');
                        
                        // Get the circle content container
                        const contentContainer = entry.target.querySelector('.circle-content-container');
                        if (contentContainer) {
                            // First set opacity to 1
                            contentContainer.style.opacity = '1';
                            
                            // Then add a class to handle the text reveal animation
                            setTimeout(() => {
                                contentContainer.classList.add('content-visible');
                            }, 200);
                        }
                    }, 300);
                } else {
                    // When card leaves viewport, remove the in-view class and content-visible class
                    entry.target.classList.remove('in-view');
                    
                    const contentContainer = entry.target.querySelector('.circle-content-container');
                    if (contentContainer) {
                        contentContainer.classList.remove('content-visible');
                        contentContainer.style.opacity = '0';
                    }
                }
            });
        },
        { 
            threshold: 0.6, // When 60% of the element is visible
            rootMargin: '-5% 0px' // Trigger slightly after the card enters viewport
        }
    );
    
    // Observe all mobile cards
    updatedCards.forEach(card => {
        observer.observe(card);
    });
    
    // Create a simple entrance animation for the cards
    gsap.from('.mobile-card', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.2, // Stagger for better sequential effect
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
    
    // Add click event to each FAQ question
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // Get the parent FAQ item
            const faqItem = question.parentElement;
            
            // Toggle active class on the FAQ item
            faqItem.classList.toggle('active');
        });
    });
    
    // Add scroll animations for FAQ items
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
            scrub: false,
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
            scrub: false,
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
            start: "top 85%", // Start animation slightly earlier
            end: "bottom -30%", 
            scrub: 1.5, // Smoother scrubbing
            toggleActions: "play none none reverse"
        }
    })
    .to(["#circle1"], {
        filter: "blur(0px)",
        opacity: 0.95,
        duration: 4 // Faster transition
    })
    .to(["#content1"], {
        filter: "blur(0px)",
        opacity: 1,
        duration: 3 // Text becomes clear shortly after the image
    }, "-=2") // Overlap with previous animation
    .to(["#circle1"], {
        filter: "blur(8px)",
        opacity: 0.3,
        duration: 3
    }, "+=10") // Stay visible for a moment
    .to(["#content1"], {
        filter: "blur(8px)",
        opacity: 0.3,
        duration: 3
    }, "-=2"); // Blur text slightly before image

    // Animation for Circle 2 and its content
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle2-wrapper",
            start: "top 85%", // Start animation slightly earlier
            end: "bottom -30%",
            scrub: 1.5, // Smoother scrubbing
            toggleActions: "play none none reverse"
        }
    })
    .to(["#circle2"], {
        filter: "blur(0px)",
        opacity: 0.95,
        duration: 4 // Faster transition
    })
    .to(["#content2"], {
        filter: "blur(0px)",
        opacity: 1,
        duration: 3 // Text becomes clear shortly after the image
    }, "-=2") // Overlap with previous animation
    .to(["#circle2", "#content2"], {
        y: 0,
        duration: 1.5 // Duration to move up
    }, "-=1")
    .to(["#circle2"], {
        filter: "blur(8px)",
        opacity: 0.3,
        duration: 3
    }, "+=10") // Stay visible for a moment
    .to(["#content2"], {
        filter: "blur(8px)",
        opacity: 0.3,
        duration: 3
    }, "-=2"); // Blur text slightly before image

    // Animation for Circle 3 and its content
    gsap.timeline({
        scrollTrigger: {
            trigger: "#circle3-wrapper",
            start: "top 85%", // Start animation slightly earlier
            end: "bottom -30%",
            scrub: 1.5, // Smoother scrubbing
            toggleActions: "play none none reverse"
        }
    })
    .to(["#circle3"], {
        filter: "blur(0px)",
        opacity: 0.95,
        duration: 4 // Faster transition
    })
    .to(["#content3"], {
        filter: "blur(0px)",
        opacity: 1,
        duration: 3 // Text becomes clear shortly after the image
    }, "-=2") // Overlap with previous animation
    .to(["#circle3", "#content3"], {
        y: 0,
        duration: 1.5 // Duration to move up
    }, "-=1")
    .to(["#circle3"], {
        filter: "blur(8px)",
        opacity: 0.3,
        duration: 3
    }, "+=10") // Stay visible for a moment
    .to(["#content3"], {
        filter: "blur(8px)",
        opacity: 0.3,
        duration: 3
    }, "-=2"); // Blur text slightly before image
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