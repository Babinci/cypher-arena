from django.urls import path
from . import views 

urlpatterns = [
     path('soft_mode/', views.soft_mode, name='soft_mode'),  # For rendering the HTML
     path('hard_mode/', views.hard_mode, name='hard_mode'),  # For rendering the HTML
    path('get_random_word/', views.get_random_word, name='get_random_word'),  # For getting a random word as JSON
]