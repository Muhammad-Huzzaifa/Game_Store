from django.contrib import admin
from .models import (
    Games, Inventory, Carts, CartItems,
    DiscountCodes, Orders, OrderItems, Payments
)

@admin.register(Games)
class GamesAdmin(admin.ModelAdmin):
    list_display = ('title', 'genre', 'price', 'release_date', 'is_active','discount_code_id')
    search_fields = ('title', 'genre', 'developer')
    list_filter = ('genre', 'platform', 'is_active')

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('inventory_id','game_id', 'game_title','stock_quantity')
    search_fields = ('game__title',)

    def game_title(self, obj):
        return obj.game.title
    game_title.short_description = 'Game Title'

@admin.register(Carts)
class CartsAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')

@admin.register(CartItems)
class CartItemsAdmin(admin.ModelAdmin):
    list_display = ('cart_id', 'game', 'quantity')

@admin.register(DiscountCodes)
class DiscountCodesAdmin(admin.ModelAdmin):
    list_display = ('discount_code_id','code', 'discount_percentage', 'valid_from', 'valid_to', 'is_active')
    list_filter = ('is_active',)

@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ('user', 'order_date', 'total_amount', 'status')
    list_filter = ('status',)

@admin.register(OrderItems)
class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('order', 'game', 'quantity', 'price_at_purchase')

@admin.register(Payments)
class PaymentsAdmin(admin.ModelAdmin):
    list_display = ('order', 'payment_date', 'payment_status', 'payment_method')
    list_filter = ('payment_status', 'payment_method')
