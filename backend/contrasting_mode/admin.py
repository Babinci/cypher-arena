from django.contrib import admin
from .models import ContrastPair

class ContrastPairAdmin(admin.ModelAdmin):
    list_display = ('item1', 'item2', 'rating')

admin.site.register(ContrastPair, ContrastPairAdmin)


# Register your models here.
