from django.db import models
from core.managers import ExcludeFromDumpdataManager

class MainCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    main_category = models.ForeignKey(MainCategory, on_delete=models.SET_NULL, null = True)

    def __str__(self):
        return self.name

class Image(models.Model):
    category = models.ForeignKey(Category, related_name='images', on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to='images/')
    title = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.category.name}"
    
class ImageBackup(models.Model):
    category = models.ForeignKey(Category, related_name='images_backup', on_delete=models.CASCADE)
    image_file = models.ImageField(upload_to='images_backup/')
    title = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)


    # Define the default manager
    objects = models.Manager()


    exclude_from_dumpdata = ExcludeFromDumpdataManager()

    class Meta:
        default_manager_name = 'objects'