from django.db import models

# Create your models here.
class UserFeedback(models.Model):
    nickname = models.CharField(max_length=100)
    feedback = models.CharField(max_length=2000)


class UserVisit(models.Model):
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    device_type = models.CharField(max_length=20, null=True, blank=True)
    browser = models.CharField(max_length=50, null=True, blank=True)
    browser_version = models.CharField(max_length=20, null=True, blank=True)
    os = models.CharField(max_length=50, null=True, blank=True)
    device_brand = models.CharField(max_length=50, null=True, blank=True)
    device_model = models.CharField(max_length=50, null=True, blank=True)
    screen_resolution = models.CharField(max_length=20, null=True, blank=True)
    window_size = models.CharField(max_length=20, null=True, blank=True)
    path = models.CharField(max_length=200, null=True, blank=True)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Visit from {self.ip_address} at {self.timestamp}"