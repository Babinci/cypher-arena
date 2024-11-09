from django.urls import path
from .views import UserFeedbackCreateView, track_user_visit

urlpatterns = [
    path('create-feedback/', UserFeedbackCreateView.as_view(), name='create-feedback'),
    path('track-visit/', track_user_visit, name='track_visit'),
    
]