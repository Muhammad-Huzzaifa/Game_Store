from django.contrib import admin
from . import models

@admin.register(models.DiscountCodes)
class DiscountCodesAdmin(admin.ModelAdmin):
    list_display = ('discount_code_id', 'code', 'discount_percentage', 'valid_from', 'valid_to', 'is_active')
    search_fields = ('code',)
    list_filter = ('is_active', 'valid_from', 'valid_to')

@admin.register(models.Games)
class GamesAdmin(admin.ModelAdmin):
    list_display = ('game_id', 'title', 'genre', 'platform', 'developer', 'publisher', 
                   'release_date', 'price', 'is_active', 'discount_code')
    search_fields = ('title', 'genre', 'developer', 'publisher')
    list_filter = ('genre', 'platform', 'is_active', 'release_date')

@admin.register(models.Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('inventory_id', 'game', 'stock_quantity')
    search_fields = ('game__title',)
    list_filter = ('stock_quantity',)

@admin.register(models.Carts)
class CartsAdmin(admin.ModelAdmin):
    list_display = ('cart_id', 'user', 'created_at')
    search_fields = ('user__username',)
    list_filter = ('created_at',)

@admin.register(models.CartItems)
class CartItemsAdmin(admin.ModelAdmin):
    list_display = ('cart_item_id', 'cart', 'game', 'quantity')
    search_fields = ('cart__user__username', 'game__title')
    list_filter = ('quantity',)

@admin.register(models.Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'user', 'order_date', 'total_amount', 'status')
    search_fields = ('user__username', 'order_id')
    list_filter = ('status', 'order_date')

@admin.register(models.OrderItems)
class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('order_item_id', 'order', 'game', 'quantity', 'price_at_purchase')
    search_fields = ('order__user__username', 'game__title')
    list_filter = ('quantity', 'price_at_purchase')

@admin.register(models.Payments)
class PaymentsAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'order', 'payment_date', 'payment_status', 'payment_method')
    search_fields = ('order__user__username', 'payment_status')
    list_filter = ('payment_status', 'payment_method', 'payment_date')