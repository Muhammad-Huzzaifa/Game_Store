from django.shortcuts import render

# Create your views here.

def index(request):
    """Renders the index.html page."""
    return render(request, 'index.html')

def author(request):
    """Renders the author.html page."""
    return render(request, 'author.html')

def cart(request):
    """Renders the cart.html page."""
    return render(request, 'cart.html')

def contact(request):
    """Renders the contact.html page."""
    return render(request, 'contact.html')

def shop(request):
    """Renders the shop.html page."""
    return render(request, 'shop.html')

def single(request):
    """Renders the single.html page."""
    # Note: This might need modification later if you want to display
    # details for a specific game based on a URL parameter.
    return render(request, 'single.html')
