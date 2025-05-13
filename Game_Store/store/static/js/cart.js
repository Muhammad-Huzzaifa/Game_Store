document.addEventListener('DOMContentLoaded', function () {

    fetch('/cart-count/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            const counter = document.getElementById('checkout_items');
            if (counter && data.cart_count !== undefined) {
                counter.textContent = data.cart_count;
            }
        });

    // Add to cart functionality
    const buttons = document.querySelectorAll('.add-to-cart');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const gameId = this.getAttribute('data-id'); fetch(`/add-to-cart/${gameId}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const counter = document.getElementById('checkout_items');
                        if (counter && data.cart_count !== undefined) {
                            counter.textContent = data.cart_count;
                        }
                        const totalElement = document.getElementById('cart-total');
                        if (totalElement && data.total_price !== undefined) {
                            totalElement.textContent = data.total_price;
                        }
                        showMessage(data.message || 'Item added to cart successfully', 'success');
                    } else {
                        showMessage(data.message || 'Failed to add item to cart', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('An error occurred while adding item to cart', 'error');
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
                .then(response => response.json()).then(data => {
                    if (data.success) {
                        // Update quantity on page without reloading
                        const quantityElement = this.closest('.d-flex').querySelector('h5');
                        if (quantityElement) {
                            quantityElement.textContent = data.quantity;
                            
                            // Update the total price for this item
                            const totalElement = this.closest('.cart-item').querySelector('.d-flex:nth-child(3) h5');
                            if (totalElement) {
                                totalElement.innerHTML = `<i class="fas fa-dollar-sign"></i> ${data.item_total}`;
                            }
                            
                            // Update cart count in navbar
                            const counter = document.getElementById('checkout_items');
                            if (counter && data.cart_count !== undefined) {
                                counter.textContent = data.cart_count;
                            }
                            
                            showMessage('Cart quantity updated successfully', 'success');
                        } else {
                            location.reload();
                        }
                    } else {
                        showMessage(data.error || 'Failed to update cart quantity', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('An error occurred while updating the cart', 'error');
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
                .then(response => response.json()).then(data => {
                    if (data.success) {
                        // Remove item from DOM or reload
                        const listItem = this.closest('li');
                        if (listItem) {
                            listItem.remove();
                            
                            // Update cart count in navbar
                            const counter = document.getElementById('checkout_items');
                            if (counter && data.cart_count !== undefined) {
                                counter.textContent = data.cart_count;
                            }
                            
                            showMessage('Item removed from cart successfully', 'success');

                            // If cart is now empty, show message
                            if (document.querySelectorAll('#games-list li').length === 0) {
                                document.getElementById('games-list').innerHTML = '<p>Your cart is empty.</p>';
                            }
                        } else {
                            location.reload();
                        }
                    } else {
                        showMessage(data.error || 'Failed to remove item', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showMessage('An error occurred while removing the item', 'error');
                });
        });
    });
});


// function displayMessageModal(text) {
var modal;
if (!$('#modal').length) {
    modal = document.createElement('div'); // kreiram div u koji cu da smestam poruke
    modal.setAttribute('id', 'modal');
}
else {
    modal = document.getElementById('modal'); // ako postoji, onda ga dohvati
}
let message = document.createElement('div');
message.setAttribute('id', 'message-modal');
message.innerHTML = text;

modal.appendChild(message);
let footer = document.getElementsByTagName('footer');
if ($("#modal").length) {
    modal.appendChild(message); // da ne dolazi do preklapanja poruka, vec da se ispisuju jedna ispod druge
} else {
    $(modal).insertAfter(footer); // da ga postavim na kraju stranice
}
$(message).fadeIn();
let promise = new Promise((resolve, reject) => {  //promise da bih obrisao element nakon izvrsvanja fade out-a, simuliram asinhroni zahtev pomocu timeout
    setTimeout(() => { $(message).fadeOut(); resolve() }, 3000);
})
promise.then(() => { // cekamo izvrsavanje promise-a
    setTimeout(() => {// nakon sto je gotov promise, izvrsava se i brise element nakon jedne sekunde
        $(message).remove();
    }, 1000)
})
