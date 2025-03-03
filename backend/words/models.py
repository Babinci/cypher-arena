from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.
class Word(models.Model):
    name = models.CharField(max_length=255, unique=True)
    occurrence = models.PositiveIntegerField()
    speech_part = models.CharField(null=True, max_length=1024)

    def __str__(self):
        return self.name


class Temator(models.Model):
    name = models.CharField(max_length=511, unique=True)
    source = models.CharField(max_length=100, default='standard')


class ContrastPair(models.Model):
    item1 = models.CharField(max_length=100)
    item2 = models.CharField(max_length=100)
    rating = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.item1} vs {self.item2}"

class ContrastPairRating(models.Model):
    contrast_pair = models.ForeignKey(ContrastPair, on_delete=models.CASCADE, related_name='ratings')
    user_fingerprint = models.CharField(max_length=255)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('contrast_pair', 'user_fingerprint')

    def __str__(self):
        return f"Rating for {self.contrast_pair} by {self.user_fingerprint}"

class ContrastTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    pairs = models.ManyToManyField(ContrastPair, related_name='tags')

    def __str__(self):
        return self.name




class CypherArenaPerplexityDeepResearch(models.Model):
    data_response = models.JSONField(default=dict)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    search_type = models.CharField(null=True, blank=True, max_length=255)  ##deep_research, normal_search
    news_source = models.CharField(null=True, blank=True, max_length=255)  ##news, showbiznes, sport, tech, science, politics



##### scraped models