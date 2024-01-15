from django.contrib import admin
from .models import Word
# Register your models here.
class WordsAdmin(admin.ModelAdmin):
    list_display = ('name', 'occurrence')

admin.site.register(Word, WordsAdmin)