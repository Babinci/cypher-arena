from django.urls import path
from . import views 

urlpatterns = [
    path('get_random_word/', views.RandomWordAPIView.as_view(), name='get_random_word'),  # For getting a random word as JSON
    path('get_topics/', views.TopicAPIView.as_view(), name='get_random_word'),  # For getting a random word as JSON
]