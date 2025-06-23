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
            const cartTotalElement = document.getElementById('cart-total');
            if (cartTotalElement && data.cart_total !== undefined) {
                cartTotalElement.textContent = data.cart_total.toFixed(2);
            }
        });


    //Validation
    const form = document.getElementById('checkoutOrder');
    const submitBtn = document.getElementById('checkout');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    const termsCheckbox = document.getElementById('terms');
    
    // Card number formatting
    const cardInput = document.getElementById('card');
    const cvvInput = document.getElementById('cvv');
    const dateInput = document.getElementById('date');
    const cardTypeSelect = document.getElementById('cardType');
    
    // Format card number with spaces
    cardInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue !== e.target.value) {
            e.target.value = formattedValue;
        }
        validateCardNumber();
    });
    
    // Format expiration date
    dateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
        validateExpirationDate();
    });
    
    // CVV validation
    cvvInput.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        validateCVV();
    });
    
    // ZIP code validation
    document.getElementById('zipcode').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9-]/g, '');
    });
    
    // Real-time validation for all fields
    requiredFields.forEach(field => {
        field.addEventListener('input', validateForm);
        field.addEventListener('blur', function() {
            validateField(field);
        });
    });
    
    termsCheckbox.addEventListener('change', validateForm);
    cardTypeSelect.addEventListener('change', validateForm);
    
    function validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove previous validation classes
        field.classList.remove('is-valid', 'is-invalid');
        
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        } else if (value) {
            switch (fieldName) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address.';
                    }
                    break;
                case 'card':
                    if (!validateCardNumber()) {
                        isValid = false;
                        errorMessage = 'Please enter a valid card number.';
                    }
                    break;
                case 'cvv':
                    if (!validateCVV()) {
                        isValid = false;
                        errorMessage = 'Please enter a valid CVV.';
                    }
                    break;
                case 'date':
                    if (!validateExpirationDate()) {
                        isValid = false;
                        errorMessage = 'Please enter a valid expiration date (MM/YY).';
                    }
                    break;
                case 'zipcode':
                    if (value.length < 5) {
                        isValid = false;
                        errorMessage = 'Please enter a valid ZIP code.';
                    }
                    break;
            }
        }
        
        // Apply validation styling
        if (isValid && value) {
            field.classList.add('is-valid');
        } else if (!isValid) {
            field.classList.add('is-invalid');
        }
        
        // Show error message
        const errorElement = document.getElementById(fieldName + '-error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
        
        return isValid;
    }
    
    function validateCardNumber() {
        const cardNumber = cardInput.value.replace(/\s/g, '');
        const cardType = cardTypeSelect.value;
        
        if (cardNumber.length < 13 || cardNumber.length > 19) {
            return false;
        }
        
        // Basic Luhn algorithm check
        let sum = 0;
        let isEven = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
    
    function validateCVV() {
        const cvv = cvvInput.value;
        const cardType = cardTypeSelect.value;
        
        if (cardType === 'amex') {
            return cvv.length === 4;
        } else {
            return cvv.length === 3;
        }
    }
    
    function validateExpirationDate() {
        const date = dateInput.value;
        if (!/^\d{2}\/\d{2}$/.test(date)) {
            return false;
        }
        
        const [month, year] = date.split('/').map(num => parseInt(num, 10));
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (month < 1 || month > 12) {
            return false;
        }
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return false;
        }
        
        return true;
    }
    
    function validateForm() {
        let allValid = true;
        
        // Check all required fields
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
            } else {
                // Run specific validation for each field
                if (!validateField(field)) {
                    allValid = false;
                }
            }
        });
        
        // Check terms checkbox
        if (!termsCheckbox.checked) {
            allValid = false;
        }
        
        // Enable/disable submit button
        submitBtn.disabled = !allValid;
        
        return allValid;
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            alert('Please fill in all required fields correctly.');
            return false;
        }
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
    });
    
    // Initial validation
    validateForm();
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
                        const cartTotalElement = document.getElementById('cart-total');
                        if (cartTotalElement && data.cart_total !== undefined) {
                            cartTotalElement.textContent = data.cart_total.toFixed(2);
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
                            // Update cart total in the summary
                            const cartTotalElement = document.getElementById('cart-total');
                            if (cartTotalElement && data.cart_total !== undefined) {
                                cartTotalElement.textContent = data.cart_total.toFixed(2);
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
                            // Update cart total in the summary
                            const cartTotalElement = document.getElementById('cart-total');
                            if (cartTotalElement && data.cart_total !== undefined) {
                                cartTotalElement.textContent = data.cart_total.toFixed(2);
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
