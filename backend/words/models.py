from django.db import models


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


class CypherArenaPerplexityDeepResearch(models.Model):
    data_response = models.JSONField(default=dict)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    search_type = models.CharField(null=True, blank=True, max_length=255)  ##deep_research, normal_search
    news_source = models.CharField(null=True, blank=True, max_length=255)  ##news, showbiznes, sport, tech, science, politics



##### scraped models