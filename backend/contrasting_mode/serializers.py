from rest_framework import serializers
from .models import ContrastPair, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ContrastPairSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = ContrastPair
        fields = ['id', 'item1', 'item2', 'rating', 'tags', 'created_at', 'updated_at']