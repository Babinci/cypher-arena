from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .models import Word
import random
from django.http import JsonResponse
# Existing soft_mode view for rendering HTML
def soft_mode(request):
    return render(request, 'soft_mode.html')

def get_random_word(request):
    words = Word.objects.filter(occurrence__gt=20).order_by('?')[:10000]  # Fetch 10 random words
    word_list = [word.name for word in words]
    return JsonResponse({'words': word_list})
# # New view for fetching a random word
# def get_random_word(request):
#     words = Word.objects.filter(occurrence__gt=20)
#     if words:
#         word = random.choice(words).name
#     else:
#         word = "No words available"
#     return JsonResponse({'word': word})  # Return a JSON response