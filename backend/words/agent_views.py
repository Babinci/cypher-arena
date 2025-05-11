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
    AgentTopicBatchUpdateSerializer,
    AgentContrastPairBatchUpdateSerializer,
    AgentNewsInputSerializer,
    AgentNewsBatchCreateSerializer
)
from .permissions import AgentTokenPermission
import hashlib
from django_user_agents.utils import get_user_agent
from collections import OrderedDict # Import OrderedDict
import base64 # Added for vector embedding handling


# Helper function for fingerprinting (copied from views.py)
def _get_user_fingerprint(request):
    user_agent = get_user_agent(request)
    ip_address = request.META.get('REMOTE_ADDR', '')
    fingerprint_string = f"{user_agent.browser.family}-{user_agent.browser.version_string}-{user_agent.os.family}-{user_agent.os.version_string}-{ip_address}"
    fingerprint_hash = hashlib.sha256(fingerprint_string.encode('utf-8')).hexdigest()
    return fingerprint_hash

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'count' # Items per page
    max_page_size = 5000 # Increased max page size as requested (using the higher value for now)

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('total', self.page.paginator.count), # Total items across all pages
            ('page', self.page.number), # Current page number
            ('count', self.get_page_size(self.request)), # Items on the current page
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data)
        ]))

# ----------------------
# Agent: Contrast Pairs
# ----------------------

class AgentContrastPairListCreateAPIView(APIView):
    permission_classes = [AgentTokenPermission]
    pagination_class = CustomPagination

    @swagger_auto_schema(
        operation_summary="Get contrast pairs (paginated)",
        operation_description="""
        Retrieve a paginated list of contrast pairs. Supports query parameters for pagination.
        - `page`: Page number
        - `count`: Items per page (max 2000)
        - `random`: Return results in random order (boolean)
        - `vector_embedding`: Include vector embedding in results (boolean)
        """,
        manual_parameters=[
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
            openapi.Parameter('count', openapi.IN_QUERY, description="Items per page (max 2000)", type=openapi.TYPE_INTEGER),
            openapi.Parameter('random', openapi.IN_QUERY, description="Return in random order", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('vector_embedding', openapi.IN_QUERY, description="Include vector embedding", type=openapi.TYPE_BOOLEAN),
        ],
        responses={200: ContrastPairSerializer(many=True)}
    )
    def get(self, request):
        """Get a paginated list of contrast pairs."""
        # Get query params
        random_order = request.query_params.get('random', 'false').lower() == 'true'
        include_embedding = request.query_params.get('vector_embedding', 'false').lower() == 'true'

        queryset = ContrastPair.objects.all()

        if random_order:
            queryset = queryset.order_by('?')
        else:
            queryset = queryset.order_by('-created_at')

        # Adjust max_page_size specifically for this view if needed, otherwise use global CustomPagination
        self.pagination_class.max_page_size = 2000 # Specific max for this endpoint

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)

        serializer_context = {'request': request}
        if page is not None:
            serializer = ContrastPairSerializer(page, many=True, context=serializer_context)
            data = serializer.data
            # Conditionally remove embedding if not requested
            if not include_embedding:
                for item in data:
                    item.pop('vector_embedding', None)
            return paginator.get_paginated_response(data)

        serializer = ContrastPairSerializer(queryset, many=True, context=serializer_context)
        data = serializer.data
        # Conditionally remove embedding if not requested
        if not include_embedding:
            for item in data:
                item.pop('vector_embedding', None)
        return Response(data)

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
    permission_classes = [AgentTokenPermission]
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
    permission_classes = [AgentTokenPermission]
    @swagger_auto_schema(
        operation_summary="Get news",
        operation_description="""
        Retrieve news records filtered by date range and news type.
        - `start_time`: Start datetime (ISO8601)
        - `end_time`: End datetime (ISO8601)
        - `news_type`: News category (e.g., general_news, polish_showbiznes, sport, tech, science, politics)
        If start_time and end_time are not provided, returns all news ordered by latest start_date.
        """,
        manual_parameters=[
            openapi.Parameter('start_time', openapi.IN_QUERY, description="Start datetime (ISO8601, optional)", type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, required=False),
            openapi.Parameter('end_time', openapi.IN_QUERY, description="End datetime (ISO8601, optional)", type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, required=False),
            openapi.Parameter('news_type', openapi.IN_QUERY, description="News category (optional)", type=openapi.TYPE_STRING),
        ],
        responses={200: AgentNewsSerializer(many=True), 400: 'Bad Request'}
    )
    def get(self, request):
        """Get news records filtered by date and type, or all if no dates specified."""
        start_time_str = request.query_params.get('start_time')
        end_time_str = request.query_params.get('end_time')
        news_type = request.query_params.get('news_type')

        queryset = CypherArenaPerplexityDeepResearch.objects.all().order_by('-start_date')

        # Filter by date only if both start and end times are provided
        if start_time_str and end_time_str:
            try:
                start_time = parse_datetime(start_time_str)
                end_time = parse_datetime(end_time_str)
                if not start_time or not end_time:
                    raise ValueError("Invalid datetime format")
                queryset = queryset.filter(
                    start_date__gte=start_time,
                    end_date__lte=end_time
                )
            except ValueError:
                return Response({"error": "Invalid datetime format. Please use ISO 8601 format (e.g., YYYY-MM-DDTHH:MM:SSZ)."}, status=status.HTTP_400_BAD_REQUEST)
        elif start_time_str or end_time_str:
            # If only one date is provided, it's ambiguous, return error or handle as needed
            # For now, we require both or none.
            return Response({"error": "Both 'start_time' and 'end_time' must be provided together for date filtering."}, status=status.HTTP_400_BAD_REQUEST)

        # Optional filtering by news_type
        if news_type:
            queryset = queryset.filter(news_source=news_type)

        serializer = AgentNewsSerializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Batch create news records",
        operation_description="Create multiple news records in a single request.",
        request_body=AgentNewsBatchCreateSerializer,
        responses={201: AgentNewsSerializer(many=True), 400: 'Bad Request'}
    )
    def post(self, request):
        """Batch create news records."""
        serializer = AgentNewsBatchCreateSerializer(data=request.data)
        if serializer.is_valid():
            news_data = serializer.validated_data['news_items']
            created_news = []
            try:
                with transaction.atomic():
                    for item_data in news_data:
                        news_item = CypherArenaPerplexityDeepResearch.objects.create(**item_data)
                        created_news.append(news_item)
                response_serializer = AgentNewsSerializer(created_news, many=True)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                 return Response({"error": f"Failed to create news items: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------
# Agent Topics
# -------------

class AgentTopicListCreateUpdateAPIView(APIView):
    permission_classes = [AgentTokenPermission]
    pagination_class = CustomPagination

    @swagger_auto_schema(
        operation_summary="Get topics (paginated)",
        operation_description="""
        Retrieve a paginated list of topics. Supports query parameters for pagination and filtering.
        - `page`: Page number
        - `count`: Items per page (max 5000)
        - `source`: Filter by topic source (optional)
        - `random`: Return results in random order (boolean)
        - `vector_embedding`: Include vector embedding in results (boolean)
        """,
        manual_parameters=[
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER),
            openapi.Parameter('count', openapi.IN_QUERY, description="Items per page (max 5000)", type=openapi.TYPE_INTEGER),
            openapi.Parameter('source', openapi.IN_QUERY, description="Topic source", type=openapi.TYPE_STRING),
            openapi.Parameter('random', openapi.IN_QUERY, description="Return in random order", type=openapi.TYPE_BOOLEAN),
            openapi.Parameter('vector_embedding', openapi.IN_QUERY, description="Include vector embedding", type=openapi.TYPE_BOOLEAN),
        ],
        responses={200: AgentTematorSerializer(many=True), 400: 'Bad Request'}
    )
    def get(self, request):
        """Get a paginated list of topics."""
        source = request.query_params.get('source')
        random_order = request.query_params.get('random', 'false').lower() == 'true'
        include_embedding = request.query_params.get('vector_embedding', 'true').lower() == 'true' # Default to true for topics

        queryset = Temator.objects.all()

        if source:
            queryset = queryset.filter(source=source)

        if random_order:
            queryset = queryset.order_by('?')
        else:
            queryset = queryset.order_by('name')

        # Adjust max_page_size specifically for this view if needed, otherwise use global CustomPagination
        self.pagination_class.max_page_size = 5000 # Specific max for this endpoint

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)

        serializer_context = {'request': request}
        if page is not None:
            serializer = AgentTematorSerializer(page, many=True, context=serializer_context)
            data = serializer.data
            # Conditionally remove embedding if not requested
            if not include_embedding:
                for item in data:
                    item.pop('vector_embedding', None)
            return paginator.get_paginated_response(data)

        serializer = AgentTematorSerializer(queryset, many=True, context=serializer_context)
        data = serializer.data
        # Conditionally remove embedding if not requested
        if not include_embedding:
            for item in data:
                item.pop('vector_embedding', None)
        return Response(data)

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
        operation_description="Update multiple topics in a single request. Each update must include the topic ID and fields to update (name, source, vector_embedding).",
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
                        # Explicitly pop id, handle embedding separately
                        update_fields = {k: v for k, v in update_data.items() if k not in ['id', 'vector_embedding']}
                        vector_embedding_str = update_data.get('vector_embedding')

                        try:
                            topic = Temator.objects.get(pk=topic_id)
                            # Update standard fields
                            for field, value in update_fields.items():
                                setattr(topic, field, value)

                            # Handle vector embedding update (decode from base64 if provided)
                            if vector_embedding_str is not None:
                                try:
                                    # Handle empty string case for nulling the field
                                    if vector_embedding_str == "":
                                        topic.vector_embedding = None
                                    else:
                                        topic.vector_embedding = base64.b64decode(vector_embedding_str)
                                except (TypeError, base64.binascii.Error) as decode_error:
                                    errors.append(f"Error decoding vector_embedding for topic {topic_id}: {decode_error}")
                                    continue # Skip saving this topic if embedding is invalid

                            topic.save()
                            updated_count += 1
                            updated_ids.append(topic_id)
                        except Temator.DoesNotExist:
                            errors.append(f"Temator with id {topic_id} does not exist.")
                        except Exception as e:
                            errors.append(f"Error updating topic {topic_id}: {str(e)}")

                if errors:
                    # If any errors occurred, return 400
                    return Response({"errors": errors, "updated_count": updated_count, "updated_ids": updated_ids}, status=status.HTTP_400_BAD_REQUEST)

                return Response({"status": "batch update successful", "updated_count": updated_count, "updated_ids": updated_ids}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": f"Failed to update topics: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ++++++++++++++
# Added View for Batch Contrast Pair Update
# ++++++++++++++

class AgentContrastPairBatchUpdateAPIView(APIView):
    permission_classes = [AgentTokenPermission]
    @swagger_auto_schema(
        operation_summary="Batch update contrast pairs",
        operation_description="Update multiple contrast pairs in a single request. Each update must include the pair ID and fields to update (item1, item2, vector_embedding).",
        request_body=AgentContrastPairBatchUpdateSerializer,
        responses={200: 'OK', 400: 'Bad Request'}
    )
    def patch(self, request):
        """Batch update contrast pairs."""
        serializer = AgentContrastPairBatchUpdateSerializer(data=request.data)
        if serializer.is_valid():
            updates_data = serializer.validated_data['updates']
            updated_count = 0
            errors = []
            updated_ids = []

            try:
                with transaction.atomic():
                    for update_data in updates_data:
                        pair_id = update_data['id']
                        # Explicitly pop id, handle embedding separately
                        update_fields = {k: v for k, v in update_data.items() if k not in ['id', 'vector_embedding']}
                        vector_embedding_str = update_data.get('vector_embedding')

                        try:
                            pair = ContrastPair.objects.get(pk=pair_id)
                            # Update standard fields
                            for field, value in update_fields.items():
                                setattr(pair, field, value)

                            # Handle vector embedding update (decode from base64 if provided)
                            if vector_embedding_str is not None:
                                try:
                                    # Handle empty string case for nulling the field
                                    if vector_embedding_str == "":
                                        pair.vector_embedding = None
                                    else:
                                        pair.vector_embedding = base64.b64decode(vector_embedding_str)
                                except (TypeError, base64.binascii.Error) as decode_error:
                                    errors.append(f"Error decoding vector_embedding for pair {pair_id}: {decode_error}")
                                    continue # Skip saving this pair if embedding is invalid

                            pair.save()
                            updated_count += 1
                            updated_ids.append(pair_id)
                        except ContrastPair.DoesNotExist:
                            errors.append(f"ContrastPair with id {pair_id} does not exist.")
                        except Exception as e:
                            errors.append(f"Error updating pair {pair_id}: {str(e)}")

                if errors:
                    # If any errors occurred, return 400
                    return Response({"errors": errors, "updated_count": updated_count, "updated_ids": updated_ids}, status=status.HTTP_400_BAD_REQUEST)

                return Response({"status": "batch update successful", "updated_count": updated_count, "updated_ids": updated_ids}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": f"Failed to update pairs: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
