    // Function to safely handle messages
function showMessage(message, type = 'error', duration = 5000) {
    try {
        // Get or create message popup
        let popup = document.getElementById('message-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'message-popup';
            popup.className = 'message-popup';
            popup.innerHTML = '<div class="message-content"><span class="message-text"></span></div>';
            document.body.appendChild(popup);
        }

        // Handle different message formats
        let messageText = '';
        if (typeof message === 'string') {
            messageText = message;
        } else if (message && typeof message === 'object') {
            messageText = message.text || message.message || String(message);
        } else {
            messageText = String(message);
        }

        // Update popup content and styling
        popup.classList.remove('error', 'success');
        popup.classList.add(type);
        const textElement = popup.querySelector('.message-text');
        if (textElement) {
            textElement.textContent = messageText;
        }

        // Show the popup
        popup.style.display = 'block';

        // Hide after duration
        setTimeout(() => {
            popup.style.display = 'none';
        }, duration);

    } catch (error) {
        console.error('Error showing message:', error);
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

