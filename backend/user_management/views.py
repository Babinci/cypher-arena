from django.shortcuts import render

# Create your views here.
from rest_framework import serializers
from .models import UserFeedback
from rest_framework import generics
from .models import UserFeedback

class UserFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFeedback
        fields = ['nickname', 'feedback']





class UserFeedbackCreateView(generics.CreateAPIView):
    queryset = UserFeedback.objects.all()
    serializer_class = UserFeedbackSerializer