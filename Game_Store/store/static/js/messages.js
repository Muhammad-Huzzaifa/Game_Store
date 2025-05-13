// Toast notification system
const TOAST_CONTAINER_ID = 'toast-container';
const MAX_VISIBLE_TOASTS = 3;
const TOAST_DURATION = 5000; // 5 seconds
const TOAST_ANIMATION_DURATION = 500; // 500ms for animations

// Queue to store pending toasts
let toastQueue = [];
let activeToasts = 0;

// Function to create toast container
function createToastContainer() {
    const container = document.createElement('div');
    container.id = TOAST_CONTAINER_ID;
    container.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
}

// Function to create a single toast
function createToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        padding: 12px 24px;
        background: ${type === 'error' ? '#ff4444' : '#00C851'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: all ${TOAST_ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        text-align: center;
        min-width: 200px;
        max-width: 400px;
        z-index: 9999;
    `;
    toast.textContent = message;
    return toast;
}

// Function to show a toast
function showToast(toast) {
    // Get the current scroll position
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    // Position the toast at the bottom of the viewport
    toast.style.top = `${viewportHeight + scrollY}px`;
    document.body.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, -100%)';
        toast.style.top = `${20 + scrollY}px`; // Move to top of viewport
    });

    // Remove toast after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -200%)';

        setTimeout(() => {
            toast.remove();
            activeToasts--;
            processToastQueue();
        }, TOAST_ANIMATION_DURATION);
    }, TOAST_DURATION);
}

// Function to process the toast queue
function processToastQueue() {
    while (toastQueue.length > 0 && activeToasts < MAX_VISIBLE_TOASTS) {
        const { message, type } = toastQueue.shift();
        const toast = createToast(message, type);
        activeToasts++;
        showToast(toast);
    }
}

// Main function to show messages
function showMessage(message, type = 'error', duration = TOAST_DURATION) {
    try {
        // Convert message to string if it's an object
        const messageText = typeof message === 'string'
            ? message
            : (message.text || message.message || String(message));

        // Add to queue
        toastQueue.push({ message: messageText, type });

        // Process queue if we haven't reached max visible toasts
        if (activeToasts < MAX_VISIBLE_TOASTS) {
            processToastQueue();
        }
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Handle Django messages on page load
document.addEventListener('DOMContentLoaded', function () {
    try {
        const djangoMessages = window.djangoMessages || [];
        djangoMessages.forEach(function (message) {
            showMessage(message.text || message, message.tags || 'error');
        });
    } catch (error) {
        console.error('Error handling Django messages:', error);
    }
});