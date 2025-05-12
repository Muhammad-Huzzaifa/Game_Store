from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.utils.timezone import now
from . import models


class GameWithInventoryForm(forms.ModelForm):
    stock_quantity = forms.IntegerField(label='Stock Quantity', required=False)

    class Meta:
        model = models.Games
        exclude = ['game_id']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance.pk:
            try:
                inventory = models.Inventory.objects.get(game=self.instance)
                self.fields['stock_quantity'].initial = inventory.stock_quantity
            except models.Inventory.DoesNotExist:
                self.fields['stock_quantity'].initial = 0

        if 'discount_code' in self.fields:
            self.fields['discount_code'].queryset = models.DiscountCodes.objects.all()
            self.fields['discount_code'].label_from_instance = lambda obj: (
                f"{'✅' if obj.valid_from <= now() <= obj.valid_to else '❌'} {obj.code} ({obj.discount_percentage}%)"
            )

    def save(self, commit=True):
        game = super().save(commit)
        stock_quantity = self.cleaned_data.get('stock_quantity', 0)
        inventory, _ = models.Inventory.objects.get_or_create(game=game)
        inventory.stock_quantity = stock_quantity
        inventory.save()
        return game


class GenreInline(admin.TabularInline):
    model = models.Genres
    extra = 1

@admin.register(models.Games)
class GameAdmin(admin.ModelAdmin):
    form = GameWithInventoryForm
    inlines = [GenreInline]

    list_display = [
        'title', 'platform', 'price', 'is_active', 'release_date',
        'display_cover_image', 'get_stock_quantity', 'get_discount_percentage'
    ]
    readonly_fields = ['display_cover_image']
    search_fields = ['title', 'description', 'developer', 'publisher']
    list_filter = ['platform', 'is_active']

    def display_cover_image(self, obj):
        return format_html(f'<img src="{obj.cover_image}" width="80" height="80" />') if obj.cover_image else "-"
    display_cover_image.short_description = 'Cover Image'

    def get_stock_quantity(self, obj):
        try:
            return models.Inventory.objects.get(game=obj).stock_quantity
        except models.Inventory.DoesNotExist:
            return 0
    get_stock_quantity.short_description = 'Stock Quantity'    
    
    def get_discount_percentage(self, obj):
        discount = obj.discount_code
        if discount and discount.valid_from <= now() <= discount.valid_to:
            return f"{discount.discount_percentage}%"
        return "0%"
    get_discount_percentage.short_description = 'Discount %'


class DiscountGamesForm(forms.ModelForm):
    games = forms.ModelMultipleChoiceField(
        queryset=models.Games.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple,
        label="Select Games to Apply This Discount"
    )

    class Meta:
        model = models.DiscountCodes
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance.pk:
            self.fields['games'].initial = models.Games.objects.filter(discount_code=self.instance)

        def label_with_image(obj):
            return format_html(
                '<div style="display:flex; align-items:center; gap:10px;">'
                '<img src="{}" style="height:60px; width:auto; border-radius:4px;" />'
                '<span><strong>{}</strong></span>'
                '</div>',
                obj.cover_image,
                obj.title
            )

        self.fields['games'].label_from_instance = label_with_image

    def save(self, commit=True):
        discount = super().save(commit=False)
        if commit:
            discount.save()

        selected_games = self.cleaned_data['games']
        models.Games.objects.filter(discount_code=discount).update(discount_code=None)
        selected_games.update(discount_code=discount)
        return discount

@admin.register(models.DiscountCodes)
class DiscountCodeAdmin(admin.ModelAdmin):
    form = DiscountGamesForm
    list_display = ['code', 'discount_percentage', 'valid_from', 'valid_to', 'is_active_display']
    search_fields = ['code']
    list_filter = ['valid_from', 'valid_to']

    def is_active_display(self, obj):
        return obj.valid_from <= now() <= obj.valid_to
    is_active_display.boolean = True 
    is_active_display.short_description = 'Is Active'


class OrderItemsInline(admin.TabularInline):
    model = models.OrderItems
    extra = 0
    can_delete = False
    readonly_fields = ('game', 'game_title', 'quantity', 'price_at_purchase')
    verbose_name_plural = "Order Items"

    def game_title(self, obj):
        return obj.game.title
    game_title.short_description = 'Game Title' 

class PaymentsInline(admin.StackedInline):
    model = models.Payments
    extra = 0
    can_delete = False

    readonly_fields = ('payment_date', 'payment_method')

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return True

@admin.register(models.Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ['user', 'order_date', 'status', 'total_amount']
    list_filter = ['status', 'order_date']
    search_fields = ['order_id', 'user__username']
    inlines = [OrderItemsInline, PaymentsInline]

    readonly_fields = ['user', 'order_date', 'total_amount']
