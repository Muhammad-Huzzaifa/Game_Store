from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User


class DiscountCodes(models.Model):
    discount_code_id = models.AutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=20)
    discount_percentage = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(100)])
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()

    def __str__(self):
        return str(self.discount_code_id)
    
    class Meta:
        db_table = 'discount_codes'
        constraints = [
            models.CheckConstraint(
                check=models.Q(
                    valid_to__gt=models.F('valid_from')), 
                    name='valid_to_after_valid_from'
            ),
        ]

        
class Games(models.Model):
    game_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    platform = models.CharField(max_length=100, blank=True, null=True)
    developer = models.CharField(max_length=100, blank=True, null=True)
    publisher = models.CharField(max_length=100, blank=True, null=True)
    release_date = models.DateField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    cover_image = models.CharField(max_length=500)
    is_active = models.BooleanField(default=True)
    discount_code = models.ForeignKey(DiscountCodes, on_delete=models.CASCADE, blank=True, null=True, db_column='discount_code_id')

    def __str__(self):
        return str(self.game_id)
    
    class Meta:
        db_table = 'games'


class Genres(models.Model):
    ganre_id = models.AutoField(primary_key=True)
    game = models.ForeignKey('Games', on_delete=models.CASCADE, db_column='game_id')
    genre = models.CharField(max_length=50)

    def __str__(self):
        return str(self.ganre_id)

    class Meta:
        db_table = 'genres'
        unique_together = ('game', 'genre')


class Inventory(models.Model):
    inventory_id = models.AutoField(primary_key=True)
    game = models.OneToOneField(Games, on_delete=models.CASCADE, db_column='game_id')
    stock_quantity = models.IntegerField(validators=[MinValueValidator(0)])

    def __str__(self):
        return str(self.inventory_id)
    
    class Meta:
        db_table = 'inventory'


class Carts(models.Model):
    cart_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)

    def __str__(self):
        return str(self.cart_id)
    
    class Meta:
        db_table = 'carts'


class CartItems(models.Model):
    cart_item_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(Carts, on_delete=models.CASCADE, db_column='cart_id')
    game = models.ForeignKey(Games, on_delete=models.CASCADE, db_column='game_id')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])

    def __str__(self):
        return str(self.cart_item_id)
    
    class Meta:
        db_table = 'cart_items'
        unique_together = (('cart', 'game'),)


class Orders(models.Model):
    ORDER_STATUS_CHOICES = [
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
    ]
    order_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_date = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=50, choices=ORDER_STATUS_CHOICES)

    def __str__(self):
        return str(self.order_id)
    
    class Meta:
        db_table = 'orders'
        constraints = [
            models.CheckConstraint(
                check=models.Q(
                    status__in=['Processing', 'Shipped', 'Delivered']), 
                    name='status_check'
            ),
        ]


class OrderItems(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE, db_column='order_id')
    game = models.ForeignKey(Games, on_delete=models.CASCADE, db_column='game_id')
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    def __str__(self):
        return str(self.order_item_id)
    
    class Meta:
        db_table = 'order_items'
        unique_together = (('order', 'game'),)


class Payments(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('Credit Card', 'Credit Card'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Cash', 'Cash'),
    ]
    payment_id = models.AutoField(primary_key=True)
    order = models.OneToOneField(Orders, models.CASCADE)
    payment_date = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    payment_status = models.CharField(max_length=50, choices=PAYMENT_STATUS_CHOICES)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)

    def __str__(self):
        return str(self.payment_id)
    
    class Meta:
        db_table = 'payments'
        constraints = [
            models.CheckConstraint(
                check=models.Q(
                    payment_status__in=['Pending', 'Completed', 'Failed']), 
                    name='payment_status_check'
            ),
            models.CheckConstraint(
                check=models.Q(
                    payment_method__in=['Credit Card', 'Bank Transfer', 'Cash']), 
                    name='payment_method_check'
            ),
        ]
