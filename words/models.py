from django.db import models


# Create your models here.
class Word(models.Model):
    name = models.CharField(max_length=255, unique=True)
    occurrence = models.PositiveIntegerField()
    speech_part = models.CharField(null=True)

    def __str__(self):
        return self.name
