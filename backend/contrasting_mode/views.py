from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from random import sample
from .models import ContrastPair, Tag
from .serializers import ContrastPairSerializer, TagSerializer
from django.db.models import Q



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

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        pair = self.get_object()
        rating = request.data.get("rating")
        print(rating)
        if rating is not None:
            pair.rating = rating
            pair.save()
            return Response({"status": "rating updated"})
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
