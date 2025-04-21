from rest_framework import serializers
from .models import ContrastPair, ContrastTag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContrastTag
        fields = ["id", "name"]


class ContrastPairSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = ContrastPair
        fields = ["id", "item1", "item2", "tags", "ratings"]