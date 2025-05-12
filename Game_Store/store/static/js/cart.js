document.addEventListener('DOMContentLoaded', function () {
    // Add to cart functionality
    const buttons = document.querySelectorAll('.add-to-cart');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const gameId = this.getAttribute('data-id');
            fetch(`/add-to-cart/${gameId}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Game added to cart!');
                } else {
                    alert('Error adding game to cart.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    // Update cart quantity
    const csrfToken = document.getElementById("csrf-token")?.value;
    
    document.querySelectorAll('.quantityBtn').forEach(button => {
        button.addEventListener('click', function () {
            const gameId = this.getAttribute('data-id');
            const action = this.getAttribute('data-quantity');
            
            console.log('Updating quantity:', gameId, action); // Debug

            fetch("/update-cart-quantity/", {  // Use absolute URL path instead of template tag
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'game_id': gameId,
                    'action': action
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response:', data); // Debug
                if (data.success) {
                    // Update quantity on page without reloading
                    const quantityElement = this.closest('.d-flex').querySelector('h5');
                    if (quantityElement) {
                        quantityElement.textContent = data.quantity;
                    } else {
                        location.reload();
                    }
                } else {
                    alert(data.error || 'Failed to update cart.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the cart.');
            });
        });
    });

    document.querySelectorAll('.removeGame').forEach(button => {
        button.addEventListener('click', function () {
            const gameId = this.getAttribute('data-id');
            
            fetch("/remove-from-cart/", {  // Use absolute URL path instead of template tag
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'game_id': gameId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove item from DOM or reload
                    const listItem = this.closest('li');
                    if (listItem) {
                        listItem.remove();
                        
                        // If cart is now empty, show message
                        if (document.querySelectorAll('#games-list li').length === 0) {
                            document.getElementById('games-list').innerHTML = '<p>Your cart is empty.</p>';
                        }
                    } else {
                        location.reload();
                    }
                } else {
                    alert(data.error || 'Failed to remove item.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while removing the item.');
            });
        });
    });
});