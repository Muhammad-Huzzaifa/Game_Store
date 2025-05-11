from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import Sum, Value, IntegerField
from django.db.models.functions import Coalesce
from . import models


def index(request):
    """Renders the index.html page with new releases, hot sales, and top sellers."""
    try:
        # New Releases
        new_releases = models.Games.objects.filter(
            is_active=True,
            release_date__isnull=False
        ).order_by('-release_date')[:4]
        for game in new_releases:
            if game.discount_code:
                discount_amount = (game.price * game.discount_code.discount_percentage) / 100
                game.discounted_price = game.price - discount_amount
            else:
                game.discounted_price = None
        
        # Hot Sales
        hot_sales = models.Games.objects.filter(
            is_active=True,
            discount_code__isnull=False
        ).annotate(
            total_sales=Coalesce(
                Sum('orderitems__quantity'),
                Value(0),
                output_field=IntegerField()
            )
        ).order_by('-total_sales')[:4]
        for game in hot_sales:
            if game.discount_code:
                discount_amount = (game.price * game.discount_code.discount_percentage) / 100
                game.discounted_price = game.price - discount_amount
            else:
                game.discounted_price = None
        
        # Top Sellers
        top_sellers = models.Games.objects.filter(
            is_active=True,
            discount_code__isnull=True
        ).annotate(
            total_sales=Coalesce(
                Sum('orderitems__quantity'),
                Value(0),
                output_field=IntegerField()
            )
        ).order_by('-total_sales')[:4]

        context = {
            'user': request.user,
            'new_releases': new_releases,
            'hot_sales': hot_sales,
            'top_sellers': top_sellers,
        }
        return render(request, 'store/index.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in index view: {str(e)}")
        return render(request, 'store/index.html', {'user': request.user})
    

def auth(request):
    """Renders the authentication page."""
    return render(request, 'store/auth.html')


def login_view(request):
    """Handles user login."""
    if request.method == 'POST':
        login_identifier = request.POST.get('login_identifier', '')
        password = request.POST.get('password', '')
        
        if not login_identifier or not password:
            messages.error(request, 'Please enter both username/email and password.')
            return redirect('store:auth')
            
        try:
            if '@' in login_identifier:
                try:
                    validate_email(login_identifier)
                    user = User.objects.get(email=login_identifier)
                    username = user.username
                except (ValidationError, User.DoesNotExist):
                    messages.error(request, 'No user found with this email address.')
                    return redirect('store:auth')
            else:
                username = login_identifier

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.get_full_name() or user.username}!')
                return redirect('store:index')
            else:
                messages.error(request, 'Invalid password. Please try again.')
                return redirect('store:auth')
                
        except Exception as e:
            messages.error(request, 'An error occurred during login. Please try again.')
            return redirect('store:auth')
    
    return redirect('store:auth')


def signup_view(request):
    """Handles user signup."""
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return redirect('store:auth')
        elif User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return redirect('store:auth')
        elif User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
            return redirect('store:auth')
        else:
            try:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                login(request, user)
                messages.success(request, f'Account created successfully! Welcome, {first_name}!')
                return redirect('store:index')
            except Exception as e:
                messages.error(request, f'Error creating account: {str(e)}')
                return redirect('store:auth')

    return redirect('store:auth')


def logout_view(request):
    """Handles user logout."""
    if request.method == 'POST':
        logout(request)
        messages.success(request, 'You have been logged out successfully.')
        return redirect('store:index')
    
    return render(request, 'store/index.html')


def delete_account(request):
    """Handles user account deletion."""
    if request.method == 'POST' and request.user.is_authenticated:
        user = request.user
        logout(request)
        user.delete()
        messages.success(request, 'Your account has been successfully deleted.')
        return redirect('store:index')
    
    return redirect('store:index')


def shop(request):
    """Renders the shop.html page with all active games."""
    try:
        games = models.Games.objects.filter(is_active=True)
        
        # Pre-calculate discounted prices
        for game in games:
            if game.discount_code:
                discount_amount = (game.price * game.discount_code.discount_percentage) / 100
                game.discounted_price = game.price - discount_amount
            else:
                game.discounted_price = None

        context = {
            'user': request.user,
            'games': games,
        }
        return render(request, 'store/shop.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in shop view: {str(e)}")
        return render(request, 'store/shop.html', {'user': request.user})


def single(request, game_id):
    """Renders the single.html page with game details."""
    try:
        game = models.Games.objects.get(pk=game_id, is_active=True)
        
        # Calculate discounted price if applicable
        if game.discount_code:
            discount_amount = (game.price * game.discount_code.discount_percentage) / 100
            game.discounted_price = game.price - discount_amount
            game.discount_percentage = game.discount_code.discount_percentage
        else:
            game.discounted_price = None
            game.discount_percentage = None

        context = {
            'user': request.user,
            'game': game,
        }
        return render(request, 'store/single.html', context)
    except models.Games.DoesNotExist:
        messages.error(request, 'Game not found.')
        return redirect('store:shop')
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in single view: {str(e)}")
        return redirect('store:shop')


def cart(request):
    """Renders the cart.html page."""
    return render(request, 'store/cart.html')


def contact(request):
    """Renders the contact.html page."""
    try:
        context = {
            'user': request.user,
        }
        return render(request, 'store/contact.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in contact view: {str(e)}")
        return render(request, 'store/contact.html', {'user': request.user})