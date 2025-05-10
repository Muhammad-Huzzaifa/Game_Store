from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


def index(request):
    """Renders the index.html page."""
    try:
        context = {
            'user': request.user,
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
    """Renders the shop.html page."""
    try:
        context = {
            'user': request.user,
        }
        return render(request, 'store/shop.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in shop view: {str(e)}")
        return render(request, 'store/shop.html', {'user': request.user})


def single(request):
    """Renders the single.html page."""
    try:
        context = {
            'user': request.user,
        }
        return render(request, 'store/single.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in single view: {str(e)}")
        return render(request, 'store/single.html', {'user': request.user})


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