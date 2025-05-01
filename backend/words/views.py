from django.shortcuts import render
from .models import Word, Temator
import random
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from random import sample
from .models import ContrastPair, ContrastTag, ContrastPairRating
from .serializers import ContrastPairSerializer2, TagSerializer
from django.db.models import Q
from django_user_agents.utils import get_user_agent
import hashlib
from core.settings import AI_AGENT_SECRET_KEY
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsValidSecretKey

# Existing soft_mode view for rendering HTML
def soft_mode(request):
    countdown_duration = 10
    return render(request, "soft_mode.html", {"countdown_duration": countdown_duration})


def hard_mode(request):
    countdown_duration = 5
    return render(request, "soft_mode.html", {"countdown_duration": countdown_duration})

class TopicAPIView(APIView):
    def get(self, request):
        # Get the page size from query params or use default
        page_size = int(request.query_params.get('page_size', 200))
        
        # Initialize or get the list of already sent Temator IDs from the session
        if 'sent_temator_ids' not in request.session:
            request.session['sent_temator_ids'] = []
        
        sent_ids = request.session['sent_temator_ids']
        
        # Get total count of Temator objects
        total_count = Temator.objects.count()
        
        # Check if we've sent almost all Temators
        if len(sent_ids) >= total_count - page_size:
            # Reset the session if we've sent almost all Temators
            request.session['sent_temator_ids'] = []
            sent_ids = []
        
        # Query for Temators excluding already sent ones
        available_topics = Temator.objects.exclude(id__in=sent_ids)
        available_count = available_topics.count()
        
        # If we have fewer available records than the page size, just return all of them
        if available_count <= page_size:
            topics = list(available_topics)
            random.shuffle(topics)
        else:
            # Select a random subset of the available topics
            # Get all IDs (this is much faster than fetching all objects)
            available_ids = list(available_topics.values_list('id', flat=True))
            
            # Select random IDs
            random_ids = random.sample(available_ids, min(page_size, len(available_ids)))
            
            # Fetch only the randomly selected objects
            topics = list(Temator.objects.filter(id__in=random_ids))
            random.shuffle(topics)
        
        # Update the session with the newly sent IDs
        new_sent_ids = [topic.id for topic in topics]
        request.session['sent_temator_ids'] = sent_ids + new_sent_ids
        request.session.modified = True
        
        # Extract names
        word_list = [word.name for word in topics]
        
        # Return standard response (not paginated)
        return Response({
            "words": word_list
        }, status=status.HTTP_200_OK)

class RandomWordAPIView(APIView):
    def get(self, request):
        target_count = 10000
        subst_target = int(target_count * 0.3)  # 30% of 10,000
        
        # Fetch words with speech_part='subst'
        subst_words = Word.objects.filter(
            occurrence__gt=15,
            speech_part="subst"
        ).order_by("?")[:subst_target]
        
        # Fetch remaining words (70%)
        remaining_count = target_count - len(subst_words)
        remaining_words = Word.objects.filter(
            occurrence__gt=15
        ).exclude(
            id__in=[word.id for word in subst_words]
        ).order_by("?")[:remaining_count]
        
        # Merge and shuffle
        all_words = list(subst_words) + list(remaining_words)
        random.shuffle(all_words)
        word_list = [word.name for word in all_words]
        
        return Response({
            "words": word_list
        }, status=status.HTTP_200_OK)


# Create your views here.
class ContrastPairViewSet(viewsets.ModelViewSet):
    queryset = ContrastPair.objects.all()
    serializer_class = ContrastPairSerializer2

    def list(self, request):
        """
        List all contrast pairs with optional pagination.
        Query parameters:
        - count: number of items per page (default: 10)
        - page: page number (default: 1)
        """
        queryset = self.get_queryset().prefetch_related("tags").filter(
            Q(ratings__isnull=True)
        ).exclude(ratings__rating=1).order_by('?')
        count = int(request.query_params.get("count", 10))
        page = int(request.query_params.get("page", 1))
        start = (page - 1) * count
        end = start + count
        total = queryset.count()
        pairs = list(queryset[start:end])
        serializer = self.get_serializer(pairs, many=True)
        return Response({
            "results": serializer.data,
            "total": total,
            "page": page,
            "count": count
        })

    def create(self, request, *args, **kwargs):
        """
        Create a new contrast pair. Requires a valid AI_AGENT_SECRET_KEY in the 'X-Secret-Key' header.
        """
        self.permission_classes = [IsValidSecretKey]
        for permission in self.get_permissions():
            if not permission.has_permission(request, self):
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

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
            tag, created = ContrastTag.objects.get_or_create(name=tag_name)
            pair.tags.add(tag)
            return Response({"status": "tag added"})
        return Response(
            {"error": "Tag name not provided"}, status=status.HTTP_400_BAD_REQUEST
        )
