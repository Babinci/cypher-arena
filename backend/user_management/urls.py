from django.urls import path
from .views import UserFeedbackCreateView

urlpatterns = [
    path('create-feedback/', UserFeedbackCreateView.as_view(), name='create-feedback'),
]