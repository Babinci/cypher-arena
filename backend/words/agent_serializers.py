from rest_framework import serializers
from .models import ContrastPair, ContrastPairRating, Temator, CypherArenaPerplexityDeepResearch
from django.core.validators import MinValueValidator, MaxValueValidator

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


# --------------- News Serializer ------------------------

class AgentNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CypherArenaPerplexityDeepResearch
        fields = ['id', 'data_response', 'start_date', 'end_date', 'search_type', 'news_source']
        read_only_fields = fields # News is typically read-only via agent

# --------------- Topic Serializers -----------------------

class AgentTematorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Temator
        fields = ['id', 'name', 'source']

class AgentTopicInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=511, required=True)
    source = serializers.CharField(max_length=100, required=False, default='agent')

class AgentTopicBatchCreateSerializer(serializers.Serializer):
    topics = AgentTopicInputSerializer(many=True, required=True)

class AgentTopicUpdateInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    name = serializers.CharField(max_length=511, required=False)
    source = serializers.CharField(max_length=100, required=False)

    def validate(self, data):
        if 'name' not in data and 'source' not in data:
            raise serializers.ValidationError("At least one field ('name' or 'source') must be provided for update.")
        return data

class AgentTopicBatchUpdateSerializer(serializers.Serializer):
    updates = AgentTopicUpdateInputSerializer(many=True, required=True)
