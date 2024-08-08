from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .models import Word
import random
from django.http import JsonResponse
# Existing soft_mode view for rendering HTML
def soft_mode(request):
    countdown_duration = 10  
    return render(request, 'soft_mode.html', {'countdown_duration': countdown_duration})
def hard_mode(request):
    countdown_duration = 5  
    return render(request, 'soft_mode.html', {'countdown_duration': countdown_duration})

def get_random_word(request):
    target_count = 10000
    subst_target = int(target_count * 0.3)  # 20% of 10,000

    # Fetch words with speech_part='subst'
    subst_words = Word.objects.filter(occurrence__gt=15, speech_part='subst').order_by('?')[:subst_target]

    # Fetch remaining words (60%)
    remaining_count = target_count - len(subst_words)
    remaining_words = Word.objects.filter(occurrence__gt=15).exclude(id__in=[word.id for word in subst_words]).order_by('?')[:remaining_count]

    # Merge and shuffle
    all_words = list(subst_words) + list(remaining_words)
    random.shuffle(all_words)

    word_list = [word.name for word in all_words]
    return JsonResponse({'words': word_list})
# # New view for fetching a random word
# def get_random_word(request):
#     words = Word.objects.filter(occurrence__gt=20)
#     if words:
#         word = random.choice(words).name
#     else:
#         word = "No words available"
#     return JsonResponse({'word': word})  # Return a JSON response