from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContrastPairViewSet

router = DefaultRouter()
router.register(r'contrast-pairs', ContrastPairViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
