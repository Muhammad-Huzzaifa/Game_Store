from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_POST
from django.db.models import Sum, Value, IntegerField
from django.db.models.functions import Coalesce
from django.contrib.auth.views import LoginView
from . import models
from .decorators import anonymous_required, user_required


def admin_check(request):
    """Check if user is admin and redirect if necessary."""
    if request.path.startswith('/admin/'):
        if not request.user.is_authenticated:
            messages.error(request, 'Please log in with an admin account to access the admin interface.')
            return redirect('store:auth')
        if not (request.user.is_staff or request.user.is_superuser):
            messages.error(request, 'You do not have permission to access the admin interface.')
            return redirect('store:index')
    elif request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        messages.error(request, 'Admin users must use the admin interface.')
        return redirect('/admin/')
    return None


def check_admin_access(request):
    """Handle unauthorized access to admin URLs."""
    if not request.user.is_authenticated:
        messages.error(request, 'Please log in with an admin account to access the admin interface.')
        return redirect('store:auth')
    elif not (request.user.is_staff or request.user.is_superuser):
        messages.error(request, 'You do not have permission to access the admin interface.')
        return redirect('store:index')
    return None


def index(request):
    """Renders the index.html page with new releases, hot sales, and top sellers."""
    admin_redirect = admin_check(request)
    if admin_redirect:
        return admin_redirect
        
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
    

@anonymous_required
def auth(request):
    """Renders the authentication page."""
    return render(request, 'store/auth.html')


@anonymous_required
def login_view(request):
    """Handles user login for both regular users and admin."""
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
                
                if user.is_staff or user.is_superuser:
                    messages.success(request, f'Welcome back, Administrator {user.get_full_name() or user.username}!')
                    return redirect('/admin/')
                    
                messages.success(request, f'Welcome back, {user.get_full_name() or user.username}!')
                return redirect('store:index')
            else:
                messages.error(request, 'Invalid password. Please try again.')
                return redirect('store:auth')
                
        except Exception as e:
            messages.error(request, 'An error occurred during login. Please try again.')
            return redirect('store:auth')
    
    return redirect('store:auth')


@anonymous_required
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


@user_required
def logout_view(request):
    """Handles user logout."""
    if request.method == 'POST':
        logout(request)
        messages.success(request, 'You have been logged out successfully.')
        return redirect('store:index')
    
    return render(request, 'store/index.html')


@user_required
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
    """Renders the shop.html page with filtered and sorted active games."""
    admin_redirect = admin_check(request)
    if admin_redirect:
        return admin_redirect
        
    try:
        games = models.Games.objects.filter(is_active=True)

        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        if min_price is not None and max_price is not None:
            games = games.filter(price__gte=min_price, price__lte=max_price)
            
        categories_param = request.GET.get('categories[]', '')
        if categories_param:
            categories = categories_param.split(',')
            if categories:
                games = games.filter(genres__genre__in=categories).distinct()    

        search_query = request.GET.get('search', '').strip()
        if search_query:
            games = games.filter(title__icontains=search_query)

        sort_by = request.GET.get('sort')
        if sort_by and sort_by != '0':  # Only apply sorting if a valid sort option is selected
            if sort_by == 'nameASC':
                games = games.order_by('title')
            elif sort_by == 'nameDESC':
                games = games.order_by('-title')
            elif sort_by == 'priceASC':
                games = games.order_by('price')
            elif sort_by == 'priceDESC':
                games = games.order_by('-price')

        for game in games:
            if game.discount_code:
                discount_amount = (game.price * game.discount_code.discount_percentage) / 100
                game.discounted_price = game.price - discount_amount
            else:
                game.discounted_price = None

        items_per_page = int(request.GET.get('numberOfProducts', 6))
        page = int(request.GET.get('page', 1))
        start_idx = (page - 1) * items_per_page
        end_idx = start_idx + items_per_page
        
        total_games = games.count()
        total_pages = (total_games + items_per_page - 1) // items_per_page

        categories = models.Genres.objects.values_list('genre', flat=True).distinct()

        context = {
            'user': request.user,
            'games': games[start_idx:end_idx],
            'total_pages': total_pages,
            'current_page': page,
            'categories': categories,
        }
        return render(request, 'store/shop.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in shop view: {str(e)}")
        return render(request, 'store/shop.html', {'user': request.user})


def single(request, game_id):
    """Renders the single.html page with game details."""
    admin_redirect = admin_check(request)
    if admin_redirect:
        return admin_redirect
        
    try:
        game = models.Games.objects.get(pk=game_id, is_active=True)
        genres = models.Genres.objects.filter(game=game).values_list('genre', flat=True)

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
            'genres': genres,
        }
        return render(request, 'store/single.html', context)
    except models.Games.DoesNotExist:
        messages.error(request, 'Game not found.')
        return redirect('store:shop')
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in single view: {str(e)}")
        return redirect('store:shop')


@user_required
def cart(request):
    """Renders the cart.html page."""
    try:
        cart=models.Carts.objects.get(user=request.user)
     # Get all cart items for this cart
        cart_items = models.CartItems.objects.filter(cart=cart).select_related('game')

    except models.Carts.DoesNotExist:
        cart_items = []

    return render(request, 'store/cart.html', {'cart_items': cart_items})
    # return render(request, 'store/cart.html')


@user_required
def add_to_cart(request, game_id):
    if request.method == 'GET':
        try:
            game = models.Games.objects.get(pk=game_id)

            # Get or create cart for this user
            cart, created = models.Carts.objects.get_or_create(user=request.user)

            # Get or create cart item
            cart_item, created = models.CartItems.objects.get_or_create(
                cart=cart,
                game=game,
                defaults={'quantity': 1}
            )

            if not created:
                # If already exists, increment quantity
                cart_item.quantity += 1
                cart_item.save()

            return JsonResponse({'success': True, 'message': 'Game added to cart'})

        except models.Games.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Game not found'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@require_POST
@user_required
def update_cart_quantity(request):
    game_id = request.POST.get('game_id')
    action = request.POST.get('action')
    
    try:
        cart = models.Carts.objects.get(user=request.user)
        item = models.CartItems.objects.get(cart=cart, game_id=game_id)
        
        if action == 'raise':
            item.quantity += 1
        elif action == 'lower' and item.quantity > 1:
            item.quantity -= 1
        
        item.save()
        return JsonResponse({'success': True, 'quantity': item.quantity})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

@require_POST
@user_required
def remove_from_cart(request):
    game_id = request.POST.get('game_id')
    
    try:
        cart = models.Carts.objects.get(user=request.user)
        models.CartItems.objects.get(cart=cart, game_id=game_id).delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def contact(request):
    """Renders the contact.html page."""
    admin_redirect = admin_check(request)
    if admin_redirect:
        return admin_redirect
        
    try:
        context = {
            'user': request.user,
        }
        return render(request, 'store/contact.html', context)
    except Exception as e:
        messages.error(request, 'An error occurred while loading the page. Please try again.')
        print(f"Error in contact view: {str(e)}")
        return render(request, 'store/contact.html', {'user': request.user})


class CustomLoginView(LoginView):
    """Custom login view for regular users."""
    template_name = 'store/auth.html'
    
    def form_valid(self, form):
        user = form.get_user()
        if user.is_staff or user.is_superuser:
            return redirect('/admin/')
        return super().form_valid(form)