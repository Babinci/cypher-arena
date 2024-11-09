from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from .models import Word, Temator
import random
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Existing soft_mode view for rendering HTML
def soft_mode(request):
    countdown_duration = 10
    return render(request, "soft_mode.html", {"countdown_duration": countdown_duration})


def hard_mode(request):
    countdown_duration = 5
    return render(request, "soft_mode.html", {"countdown_duration": countdown_duration})

class TopicAPIView(APIView):
    def get(self, request):
        topics = Temator.objects.all().order_by("?")
        word_list = [word.name for word in topics]
        
        return Response({
            "words": word_list
        }, status=status.HTTP_200_OK)

class RandomWordAPIView(APIView):
    def get(self, request):
        target_count = 10000
        subst_target = int(target_count * 0.3)  # 30% of 10,000
        
        # Fetch words with speech_part='subst'
        subst_words = Word.objects.filter(
            occurrence__gt=15,
            speech_part="subst"
        ).order_by("?")[:subst_target]
        
        # Fetch remaining words (70%)
        remaining_count = target_count - len(subst_words)
        remaining_words = Word.objects.filter(
            occurrence__gt=15
        ).exclude(
            id__in=[word.id for word in subst_words]
        ).order_by("?")[:remaining_count]
        
        # Merge and shuffle
        all_words = list(subst_words) + list(remaining_words)
        random.shuffle(all_words)
        word_list = [word.name for word in all_words]
        
        return Response({
            "words": word_list
        }, status=status.HTTP_200_OK)

