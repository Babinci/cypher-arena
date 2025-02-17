from django.core.management.base import BaseCommand, CommandError
from contrasting_mode.models import ContrastPair, ContrastPairRating
import json

class Command(BaseCommand):
    help = 'Populates ContrastPairRating from a JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the JSON file')

    def handle(self, *args, **options):
        json_file_path = options['json_file']

        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)

            for item in data:
                if item['model'] == 'contrasting_mode.contrastpair':
                    pk = item['pk']
                    rating = item['fields']['rating']

                    if rating is not None:
                        try:
                            pair = ContrastPair.objects.get(pk=pk)
                            ContrastPairRating.objects.create(
                                contrast_pair=pair,
                                user_fingerprint="kamatera_server",
                                rating=int(rating)
                            )
                        except ContrastPair.DoesNotExist:
                            self.stdout.write(self.style.WARNING(f'ContrastPair with pk {pk} not found'))
                        except ValueError:
                            self.stdout.write(self.style.WARNING(f'Invalid rating value: {rating} for ContrastPair with pk {pk}'))

            self.stdout.write(self.style.SUCCESS('Successfully populated ContrastPairRating'))

        except FileNotFoundError:
            raise CommandError(f'File "{json_file_path}" does not exist')
        except json.JSONDecodeError:
            raise CommandError(f'File "{json_file_path}" is not a valid JSON file')