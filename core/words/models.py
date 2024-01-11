from django.db import models

# Create your models here.
class Word(models.Model):
    name = models.CharField(max_length=255, unique=True)  # Define the max_length and set unique=True
    occurrence = models.PositiveIntegerField()  # Field names should be spelled correctly

    def __str__(self):
        return self.name