from rest_framework import serializers
from .models import Image

class ImageSerializer(serializers.ModelSerializer):
    image_file = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['id', 'title', 'image_file', 'uploaded_at']

    def get_image_file(self, obj):
        request = self.context.get('request')
        if request is not None:
            new_url = request.build_absolute_uri(obj.image_file.url)
            # Insert '/api' before the '/media' part of the URL
            parts = new_url.split('/media', 1)
            if len(parts) > 1:
                new_url = parts[0] + '/api/media' + parts[1]
            return new_url
        return obj.image_file.url