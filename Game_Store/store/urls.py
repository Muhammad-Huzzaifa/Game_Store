from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    path('', views.index, name='index'),
    path('auth/', views.auth, name='auth'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),    
    path('logout/', views.logout_view, name='logout'),
    path('delete-account/', views.delete_account, name='delete_account'),
    path('shop/', views.shop, name='shop'),
    path('single/<int:game_id>/', views.single, name='single'),
    path('cart/', views.cart, name='cart'),
    path('contact/', views.contact, name='contact'),
]
