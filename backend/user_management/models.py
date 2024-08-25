from django.db import models

# Create your models here.
class UserFeedback(models.Model):
    nickname = models.CharField(max_length=100)
    feedback = models.CharField(max_length=2000)