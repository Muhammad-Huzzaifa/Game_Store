from django import template

register = template.Library()

@register.filter(name='get_range')
def get_range(number):
    if isinstance(number, str):
        number = int(number)
    return range(1, number + 1)
