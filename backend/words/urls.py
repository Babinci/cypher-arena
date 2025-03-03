from django.urls import path, include
from . import views 
from rest_framework.routers import DefaultRouter
urlpatterns = [
    path('get_random_word/', views.RandomWordAPIView.as_view(), name='get_random_word'),  # For getting a random word as JSON
    path('get_topics/', views.TopicAPIView.as_view(), name='get_random_word'),  # For getting a random word as JSON
]


router = DefaultRouter()
router.register(r'contrast-pairs', views.ContrastPairViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
