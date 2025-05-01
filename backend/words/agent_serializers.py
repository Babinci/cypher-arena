from rest_framework import serializers
from .models import ContrastPair, ContrastPairRating, Temator, CypherArenaPerplexityDeepResearch
from django.core.validators import MinValueValidator, MaxValueValidator
import base64

# --------------- Contrast Pair Serializers ---------------

class AgentContrastPairInputSerializer(serializers.Serializer):
    item1 = serializers.CharField(max_length=100, required=True)
    item2 = serializers.CharField(max_length=100, required=True)

class AgentContrastPairBatchCreateSerializer(serializers.Serializer):
    pairs = AgentContrastPairInputSerializer(many=True, required=True)

class AgentContrastPairRatingInputSerializer(serializers.Serializer):
    pair_id = serializers.IntegerField(required=True)
    rating = serializers.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], required=True)

class AgentContrastPairBatchRatingSerializer(serializers.Serializer):
    ratings = AgentContrastPairRatingInputSerializer(many=True, required=True)

class AgentContrastPairUpdateInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    item1 = serializers.CharField(max_length=100, required=False)
    item2 = serializers.CharField(max_length=100, required=False)
    vector_embedding = serializers.CharField(required=False, allow_null=True, allow_blank=True) # Added allow_blank=True

    def validate(self, data):
        if 'item1' not in data and 'item2' not in data and 'vector_embedding' not in data:
            raise serializers.ValidationError("At least one field ('item1', 'item2', or 'vector_embedding') must be provided for update.")
        # Basic validation for vector_embedding if needed (e.g., base64 format) could go here
        # Validate base64 format if provided and not empty string
        vector_embedding_str = data.get('vector_embedding')
        if vector_embedding_str is not None and vector_embedding_str != "":
            try:
                base64.b64decode(vector_embedding_str)
            except (TypeError, base64.binascii.Error):
                raise serializers.ValidationError({"vector_embedding": "Invalid base64 format."})        
        return data

class AgentContrastPairBatchUpdateSerializer(serializers.Serializer):
    updates = AgentContrastPairUpdateInputSerializer(many=True, required=True)


# --------------- News Serializer ------------------------

class AgentNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CypherArenaPerplexityDeepResearch
        fields = ['id', 'data_response', 'start_date', 'end_date', 'search_type', 'news_source']
        read_only_fields = fields # News is typically read-only via agent

class AgentNewsInputSerializer(serializers.Serializer):
    data_response = serializers.JSONField(required=True)
    start_date = serializers.DateTimeField(required=True)
    end_date = serializers.DateTimeField(required=True)
    search_type = serializers.CharField(max_length=255, required=False, allow_null=True)
    news_source = serializers.CharField(max_length=255, required=False, allow_null=True)

class AgentNewsBatchCreateSerializer(serializers.Serializer):
    news_items = AgentNewsInputSerializer(many=True, required=True)


# --------------- Topic Serializers -----------------------

class AgentTematorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Temator
        fields = ['id', 'name', 'source', 'vector_embedding']

class AgentTopicInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=511, required=True)
    source = serializers.CharField(max_length=100, required=False, default='agent')

class AgentTopicBatchCreateSerializer(serializers.Serializer):
    topics = AgentTopicInputSerializer(many=True, required=True)

class AgentTopicUpdateInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    name = serializers.CharField(max_length=511, required=False)
    source = serializers.CharField(max_length=100, required=False)
    vector_embedding = serializers.CharField(required=False, allow_null=True, allow_blank=True) # Added allow_blank=True

    def validate(self, data):
        if 'name' not in data and 'source' not in data and 'vector_embedding' not in data:
            raise serializers.ValidationError("At least one field ('name', 'source', or 'vector_embedding') must be provided for update.")
        # Basic validation for vector_embedding if needed (e.g., base64 format) could go here
        # Validate base64 format if provided and not empty string
        vector_embedding_str = data.get('vector_embedding')
        if vector_embedding_str is not None and vector_embedding_str != "":
            try:
                base64.b64decode(vector_embedding_str)
            except (TypeError, base64.binascii.Error):
                raise serializers.ValidationError({"vector_embedding": "Invalid base64 format."})        
        return data

class AgentTopicBatchUpdateSerializer(serializers.Serializer):
    updates = AgentTopicUpdateInputSerializer(many=True, required=True)
