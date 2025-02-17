from django.core.management.base import BaseCommand
from words.models import Word

class Command(BaseCommand):
    help = 'Initializes the word memory bank with some default words'

    def handle(self, *args, **options):
        words = [
            {'name': 'hello', 'occurrence': 100, 'speech_part': 'greeting'},
            {'name': 'world', 'occurrence': 50, 'speech_part': 'noun'},
            {'name': 'python', 'occurrence': 75, 'speech_part': 'noun'},
        ]

        for word_data in words:
            word, created = Word.objects.get_or_create(
                name=word_data['name'],
                defaults=word_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created word "{word.name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Word "{word.name}" already exists'))