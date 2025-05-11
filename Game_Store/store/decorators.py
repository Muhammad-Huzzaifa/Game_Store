from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps


def anonymous_required(view_func):
    """Decorator for views that should only be accessed by non-authenticated users."""
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.error(request, 'You are already logged in.')
            return redirect('store:index')
        return view_func(request, *args, **kwargs)
    return wrapped


def user_required(view_func):
    """Decorator for views that should only be accessed by regular authenticated users."""
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.warning(request, 'Please log in to access this page.')
            return redirect('store:auth')
        if request.user.is_staff or request.user.is_superuser:
            messages.error(request, 'Admin users must use the admin interface.')
            return redirect('/admin/')
        return view_func(request, *args, **kwargs)
    return wrapped


def admin_required(view_func):
    """Decorator for views that should only be accessed by admin users."""
    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Please log in to access this page.')
            return redirect('store:auth')
        if not request.user.is_staff:
            messages.error(request, 'You do not have permission to access this page.')
            return redirect('store:index')
        return view_func(request, *args, **kwargs)
    return wrapped
