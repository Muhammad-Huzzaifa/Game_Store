from django.shortcuts import render

# Create your views here.
def auth(request):
    """Renders the auth page."""
    # Note: This might need modification later if you want to display
    # details for a specific game based on a URL parameter.
    return render(request, 'store/auth.html')

def index(request):
    """Renders the index.html page."""
    return render(request, 'store/index.html')

def author(request):
    """Renders the author.html page."""
    return render(request, 'store/author.html')

def cart(request):
    """Renders the cart.html page."""
    return render(request, 'store/cart.html')

def contact(request):
    """Renders the contact.html page."""
    return render(request, 'store/contact.html')

def shop(request):
    """Renders the shop.html page."""
    return render(request, 'store/shop.html')

def single(request):
    """Renders the single.html page."""
    # Note: This might need modification later if you want to display
    # details for a specific game based on a URL parameter.
    return render(request, 'store/single.html')


