from words.models import Word
import morfeusz2

morf = morfeusz2.Morfeusz()

bulk_size = 1000


def extract_part_of_speech(word):
    morfeusz_result = morf.analyse(word)
    parts_of_speech = set()
    for _, _, (word, base_form, morph_info, _, _) in morfeusz_result:
        part_of_speech = morph_info.split(":")[0]
        parts_of_speech.add(part_of_speech)
    return parts_of_speech


def update_words_in_bulk(words):
    words_to_update = []
    for word_obj in words:
        parts_of_speech = extract_part_of_speech(word_obj.name)
        word_obj.speech_part = ",".join(parts_of_speech)
        words_to_update.append(word_obj)
    return words_to_update


# Total number of words
total_words = Word.objects.count()

# Process in batches
for start in range(0, total_words, bulk_size):
    end = start + bulk_size
    word_batch = Word.objects.all()[start:end]
    words_to_update = update_words_in_bulk(word_batch)
    Word.objects.bulk_update(words_to_update, ["speech_part"])

print("Update completed")
