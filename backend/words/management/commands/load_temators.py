from django.core.management.base import BaseCommand
from words.models import Temator
import json

class Command(BaseCommand):
    help = 'Loads temators from a JSON file into the database'

    def add_arguments(self, parser):
        parser.add_argument('json_path', type=str, help='Path to the JSON file containing temator data')

    def handle(self, *args, **options):
        json_path = options['json_path']

        try:
            with open(json_path, 'r') as f:
                temator_data_list = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'JSON file not found at "{json_path}"'))
            return
        except json.JSONDecodeError:
            self.stdout.write(self.style.ERROR(f'Error decoding JSON from file "{json_path}"'))
            return

        if not isinstance(temator_data_list, list):
            self.stdout.write(self.style.ERROR('Expected a JSON list in the file'))
            return

        for temator_data in temator_data_list:
            if not isinstance(temator_data, str):
                self.stdout.write(self.style.ERROR(f'Expected list items to be strings, got: {temator_data}'))
                continue

            temator, created = Temator.objects.get_or_create(
                name=temator_data,
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created temator "{temator.name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Temator "{temator.name}" already exists'))