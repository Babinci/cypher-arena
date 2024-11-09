from django.shortcuts import render

# Create your views here.
from rest_framework import serializers
from .models import UserFeedback, UserVisit
from rest_framework import generics
from .models import UserFeedback
from rest_framework.decorators import api_view
from django_user_agents.utils import get_user_agent
from rest_framework import status
from rest_framework.response import Response
from datetime import datetime

@api_view(['POST'])
def track_user_visit(request):
    try:
        # Get user agent info from the request
        user_agent = get_user_agent(request)
        
        # Create UserVisit record
        UserVisit.objects.create(
            ip_address=request.META.get('REMOTE_ADDR'),
            city=request.data.get('location', {}).get('city'),
            region=request.data.get('location', {}).get('region'),
            country=request.data.get('location', {}).get('country'),
            device_type=request.data.get('device', {}).get('deviceType'),
            browser=user_agent.browser.family,
            browser_version=user_agent.browser.version_string,
            os=user_agent.os.family,
            device_brand=user_agent.device.brand,
            device_model=user_agent.device.model,
            screen_resolution=request.data.get('device', {}).get('screenResolution'),
            window_size=request.data.get('device', {}).get('windowSize'),
            path=request.data.get('path'),
            timestamp=datetime.now()
        )
        
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



class UserFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFeedback
        fields = ['nickname', 'feedback']





class UserFeedbackCreateView(generics.CreateAPIView):
    queryset = UserFeedback.objects.all()
    serializer_class = UserFeedbackSerializer