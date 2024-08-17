from django.db import models

# Define the custom manager outside the model class
class ExcludeFromDumpdataManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().none()