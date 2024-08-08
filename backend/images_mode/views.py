from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import Image
from .serializers import ImageSerializer

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5  # Default to 5 images per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class ImageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Retrieves a list of images, ordered randomly.
    Pagination is enabled by default with 5 images per page.
    
    Parameters:
    - page: Integer number of the page to retrieve (default 1).
    - page_size: Integer specifying number of images per page (default 5, max 100).
    
    Usage:
    - /images_mode/images/?page=2&page_size=10
    """
    queryset = Image.objects.all().order_by('?')
    serializer_class = ImageSerializer
    pagination_class = StandardResultsSetPagination