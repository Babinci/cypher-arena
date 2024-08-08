import os
from django.core.files import File
from .models import Category, Image


def sync_images(
    directory_path="/home/wojtek/freestyle_app_project/django_backend/jupyters/pexels_images",
):
    for subdir, dirs, files in os.walk(directory_path):
        for file in files:
            category_name = os.path.basename(subdir)
            category, created = Category.objects.get_or_create(name=category_name)
            file_path = os.path.join(subdir, file)
            if not Image.objects.filter(image_file=file_path).exists():
                with open(file_path, "rb") as file_handle:
                    django_file = File(file_handle)
                    image = Image(category=category)
                    image.image_file.save(file, django_file, save=True)
