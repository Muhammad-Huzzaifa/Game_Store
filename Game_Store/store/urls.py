from django.urls import path
from . import views

app_name = 'store' # Optional: Define an application namespace

urlpatterns = [
    path('', views.index, name='index'), # Root URL for the app
    path('author/', views.author, name='author'),
    path('cart/', views.cart, name='cart'),
    path('contact/', views.contact, name='contact'),
    path('shop/', views.shop, name='shop'),
    path('single/', views.single, name='single'), # Basic single page URL
    # Add more specific URLs later, e.g., path('game/<int:game_id>/', views.single, name='single_game'),
]
