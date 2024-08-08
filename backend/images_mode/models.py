from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Image(models.Model):
    category = models.ForeignKey(Category, related_name='images', on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to='images/')
    title = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.category.name}"