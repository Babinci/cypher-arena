from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from random import sample
from .models import ContrastPair, Tag, ContrastPairRating
from .serializers import ContrastPairSerializer, TagSerializer
from django.db.models import Q
from django_user_agents.utils import get_user_agent
import hashlib


# Create your views here.
class ContrastPairViewSet(viewsets.ModelViewSet):
    queryset = ContrastPair.objects.all()
    serializer_class = ContrastPairSerializer

    def list(self, request):
        # queryset = self.get_queryset().prefetch_related("tags").exclude(rating=1)

        queryset = self.get_queryset().prefetch_related("tags").filter(
            Q(rating__isnull=True) 
        ).exclude(rating=1)
        # Get the number of items to return, default to all
        count = int(request.query_params.get("count", queryset.count()))
        # Check if we should return sorted or random results
        sort = request.query_params.get("sort", "random")
        if sort == "random":
            # Get random samples
            pairs = sample(list(queryset), min(count, queryset.count()))
        else:
            # Sort by creation date if not random
            pairs = queryset.order_by("created_at")[:count]
        serializer = self.get_serializer(pairs, many=True)
        return Response(serializer.data)

    def _get_user_fingerprint(self, request):
        user_agent = get_user_agent(request)
        ip_address = request.META.get('REMOTE_ADDR', '')
        fingerprint_string = f"{user_agent.browser.family}-{user_agent.browser.version_string}-{user_agent.os.family}-{user_agent.os.version_string}-{ip_address}"
        fingerprint_hash = hashlib.sha256(fingerprint_string.encode('utf-8')).hexdigest()
        return fingerprint_hash

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        pair = self.get_object()
        rating = request.data.get("rating")

        if rating is not None:
            try:
                rating = int(rating)  # Convert to integer
                if 1 <= rating <= 5:  # Validate rating range
                    user_fingerprint = self._get_user_fingerprint(request)
                    
                    ContrastPairRating.objects.update_or_create(
                        contrast_pair=pair,
                        user_fingerprint=user_fingerprint,
                        defaults={'rating': rating}
                    )

                    return Response({"status": "rating updated"})
                else:
                    return Response(
                        {"error": "Rating must be between 1 and 5"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except ValueError:
                return Response(
                    {"error": "Rating must be an integer"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(
            {"error": "Rating not provided"}, status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=["post"])
    def add_tag(self, request, pk=None):
        pair = self.get_object()
        tag_name = request.data.get("tag")
        if tag_name:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            pair.tags.add(tag)
            return Response({"status": "tag added"})
        return Response(
            {"error": "Tag name not provided"}, status=status.HTTP_400_BAD_REQUEST
        )
