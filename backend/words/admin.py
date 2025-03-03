from django.contrib import admin
from .models import Word, ContrastPair

# Register your models here.
class WordsAdmin(admin.ModelAdmin):
    list_display = ('name', 'occurrence', 'speech_part')

class ContrastPairAdmin(admin.ModelAdmin):
    list_display = ('item1', 'item2', 'rating')

admin.site.register(ContrastPair, ContrastPairAdmin)
admin.site.register(Word, WordsAdmin)
