from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils.dateparse import parse_datetime
from .models import ContrastPair, Temator, CypherArenaPerplexityDeepResearch, ContrastPairRating
from .serializers import ContrastPairSerializer # Re-use for GET response
from .agent_serializers import (
    AgentContrastPairBatchCreateSerializer,
    AgentContrastPairBatchRatingSerializer,
    AgentNewsSerializer,
    AgentTematorSerializer,
    AgentTopicBatchCreateSerializer,
    AgentTopicBatchUpdateSerializer
)
import hashlib
from django_user_agents.utils import get_user_agent


# Helper function for fingerprinting (copied from views.py)
def _get_user_fingerprint(request):
    user_agent = get_user_agent(request)
    ip_address = request.META.get('REMOTE_ADDR', '')
    fingerprint_string = f"{user_agent.browser.family}-{user_agent.browser.version_string}-{user_agent.os.family}-{user_agent.os.version_string}-{ip_address}"
    fingerprint_hash = hashlib.sha256(fingerprint_string.encode('utf-8')).hexdigest()
    return fingerprint_hash

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'count'
    max_page_size = 100

# ----------------------
# Agent: Contrast Pairs
# ----------------------

class AgentContrastPairListCreateAPIView(APIView):
    pagination_class = StandardResultsSetPagination

    @swagger_auto_schema(
        operation_summary="Get contrast pairs (paginated)",
        operation_description="""
        Retrieve a paginated list of contrast pairs. Supports query parameters for pagination.
        - `page`: Page number
        - `count`: Items per page
        """,
        manual_parameters=[
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
            openapi.Parameter('count', openapi.IN_QUERY, description="Items per page", type=openapi.TYPE_INTEGER),
        ],
        responses={200: ContrastPairSerializer(many=True)}
    )
    def get(self, request):
        """Get a paginated list of contrast pairs."""
        queryset = ContrastPair.objects.all().order_by('-created_at')
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        if page is not None:
            serializer = ContrastPairSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ContrastPairSerializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Batch create contrast pairs",
        operation_description="Create multiple contrast pairs in a single request.",
        request_body=AgentContrastPairBatchCreateSerializer,
        responses={201: ContrastPairSerializer(many=True), 400: 'Bad Request'}
    )
    def post(self, request):
        """Batch create contrast pairs."""
        serializer = AgentContrastPairBatchCreateSerializer(data=request.data)
        if serializer.is_valid():
            pairs_data = serializer.validated_data['pairs']
            created_pairs = []
            try:
                with transaction.atomic():
                    for pair_data in pairs_data:
                        pair = ContrastPair.objects.create(**pair_data)
                        created_pairs.append(pair)
                response_serializer = ContrastPairSerializer(created_pairs, many=True)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e: # Catch potential integrity errors etc.
                 return Response({"error": f"Failed to create pairs: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AgentContrastPairBatchRateAPIView(APIView):
    @swagger_auto_schema(
        operation_summary="Batch rate contrast pairs",
        operation_description="Rate multiple contrast pairs in a single request. Each rating must include the pair ID and a rating value (1-5).",
        request_body=AgentContrastPairBatchRatingSerializer,
        responses={200: 'OK', 400: 'Bad Request'}
    )
    def post(self, request):
        """Batch rate contrast pairs."""
        serializer = AgentContrastPairBatchRatingSerializer(data=request.data)
        if serializer.is_valid():
            ratings_data = serializer.validated_data['ratings']
            user_fingerprint = _get_user_fingerprint(request) # Generate fingerprint
            updated_count = 0
            errors = []

            try:
                with transaction.atomic():
                    for rating_data in ratings_data:
                        pair_id = rating_data['pair_id']
                        rating_value = rating_data['rating']
                        try:
                            pair = ContrastPair.objects.get(pk=pair_id)
                            ContrastPairRating.objects.update_or_create(
                                contrast_pair=pair,
                                user_fingerprint=user_fingerprint,
                                defaults={'rating': rating_value}
                            )
                            updated_count += 1
                        except ContrastPair.DoesNotExist:
                            errors.append(f"ContrastPair with id {pair_id} does not exist.")
                        except Exception as e:
                            errors.append(f"Error rating pair {pair_id}: {str(e)}")

                if errors:
                    # If any errors occurred, even if some succeeded, return 400
                    return Response({"errors": errors, "updated_count": updated_count}, status=status.HTTP_400_BAD_REQUEST)

                return Response({"status": "batch rating successful", "updated_count": updated_count}, status=status.HTTP_200_OK)

            except Exception as e: # Catch potential transaction errors
                 return Response({"error": f"Failed to rate pairs: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------
# Agent News
# -----------

class AgentNewsListAPIView(APIView):
    @swagger_auto_schema(
        operation_summary="Get news",
        operation_description="""
        Retrieve news records filtered by date range and news type.
        - `start_time`: Start datetime (ISO8601)
        - `end_time`: End datetime (ISO8601)
        - `news_type`: News category (e.g., general_news, polish_showbiznes, sport, tech, science, politics)
        """,
        manual_parameters=[
            openapi.Parameter('start_time', openapi.IN_QUERY, description="Start datetime (ISO8601, required)", type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, required=True),
            openapi.Parameter('end_time', openapi.IN_QUERY, description="End datetime (ISO8601, required)", type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, required=True),
            openapi.Parameter('news_type', openapi.IN_QUERY, description="News category (optional)", type=openapi.TYPE_STRING),
        ],
        responses={200: AgentNewsSerializer(many=True), 400: 'Bad Request'}
    )
    def get(self, request):
        """Get news records filtered by date and type."""
        start_time_str = request.query_params.get('start_time')
        end_time_str = request.query_params.get('end_time')
        news_type = request.query_params.get('news_type')

        if not start_time_str or not end_time_str:
            return Response({"error": "'start_time' and 'end_time' query parameters are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_time = parse_datetime(start_time_str)
            end_time = parse_datetime(end_time_str)
            if not start_time or not end_time:
                raise ValueError("Invalid datetime format")
        except ValueError:
            return Response({"error": "Invalid datetime format. Please use ISO 8601 format (e.g., YYYY-MM-DDTHH:MM:SSZ)."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = CypherArenaPerplexityDeepResearch.objects.filter(
            start_date__gte=start_time,
            end_date__lte=end_time
        ).order_by('-start_date')

        if news_type:
            queryset = queryset.filter(news_source=news_type)

        serializer = AgentNewsSerializer(queryset, many=True)
        return Response(serializer.data)

# -------------
# Agent Topics
# -------------

class AgentTopicListCreateUpdateAPIView(APIView):
    pagination_class = StandardResultsSetPagination

    @swagger_auto_schema(
        operation_summary="Get topics (paginated)",
        operation_description="""
        Retrieve a paginated list of topics. Supports query parameters for pagination and filtering.
        - `page`: Page number
        - `count`: Items per page
        - `source`: Filter by topic source (optional)
        """,
        manual_parameters=[
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
            openapi.Parameter('count', openapi.IN_QUERY, description="Items per page", type=openapi.TYPE_INTEGER),
            openapi.Parameter('source', openapi.IN_QUERY, description="Topic source", type=openapi.TYPE_STRING),
        ],
        responses={200: AgentTematorSerializer(many=True), 400: 'Bad Request'}
    )
    def get(self, request):
        """Get a paginated list of topics."""
        source = request.query_params.get('source')
        queryset = Temator.objects.all().order_by('name')

        if source:
            queryset = queryset.filter(source=source)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        if page is not None:
            serializer = AgentTematorSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = AgentTematorSerializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Batch insert topics",
        operation_description="Insert multiple topics in a single request.",
        request_body=AgentTopicBatchCreateSerializer,
        responses={201: AgentTematorSerializer(many=True), 400: 'Bad Request'}
    )
    def post(self, request):
        """Batch insert topics."""
        serializer = AgentTopicBatchCreateSerializer(data=request.data)
        if serializer.is_valid():
            topics_data = serializer.validated_data['topics']
            created_topics = []
            try:
                with transaction.atomic():
                    for topic_data in topics_data:
                        # Use get_or_create to avoid duplicates based on name
                        topic, created = Temator.objects.get_or_create(
                            name=topic_data['name'],
                            defaults={'source': topic_data.get('source', 'agent')} # Use provided source or default
                        )
                        # Only add newly created or existing ones to the response for clarity
                        created_topics.append(topic)

                response_serializer = AgentTematorSerializer(created_topics, many=True)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                 return Response({"error": f"Failed to create topics: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_summary="Batch update topics",
        operation_description="Update multiple topics in a single request. Each update must include the topic ID and fields to update.",
        request_body=AgentTopicBatchUpdateSerializer,
        responses={200: 'OK', 400: 'Bad Request'}
    )
    def patch(self, request):
        """Batch update topics."""
        serializer = AgentTopicBatchUpdateSerializer(data=request.data)
        if serializer.is_valid():
            updates_data = serializer.validated_data['updates']
            updated_count = 0
            errors = []
            updated_ids = []

            try:
                with transaction.atomic():
                    for update_data in updates_data:
                        topic_id = update_data['id']
                        update_fields = {k: v for k, v in update_data.items() if k != 'id'}

                        try:
                            topic = Temator.objects.get(pk=topic_id)
                            for field, value in update_fields.items():
                                setattr(topic, field, value)
                            topic.save()
                            updated_count += 1
                            updated_ids.append(topic_id)
                        except Temator.DoesNotExist:
                            errors.append(f"Temator with id {topic_id} does not exist.")
                        except Exception as e:
                             errors.append(f"Error updating topic {topic_id}: {str(e)}")

                if errors:
                    # If any errors occurred, even if some succeeded, return 400
                    return Response({"errors": errors, "updated_count": updated_count, "updated_ids": updated_ids}, status=status.HTTP_400_BAD_REQUEST)

                return Response({"status": "batch update successful", "updated_count": updated_count, "updated_ids": updated_ids}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": f"Failed to update topics: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
