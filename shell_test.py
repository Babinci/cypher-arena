import os
from words.models import Word
from tqdm import tqdm

all_folder = r'C:\IT_projects\freestyle_app\ispell-pl-20021127\ispell-pl-20021127\all_in_one'
existing_words = set(Word.objects.values_list('name', flat=True))
pbar = tqdm(total=sum(len(files) for _, _, files in os.walk(all_folder)))
bulk_size = 1000  # Adjust this number based on your memory constraints

try:
    for root, dirs, files in os.walk(all_folder):
        for file in files:
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='iso-8859-2') as file_object:
                new_words = []
                for line in file_object:
                    try:
                        word, occurency = line.split()[0], int(line.split()[1])
                        word_name = word.split('/')[0]
                        if word_name not in existing_words:
                            new_words.append(Word(name=word_name, occurrence=occurency))
                            existing_words.add(word_name)

                        if len(new_words) >= bulk_size:
                            Word.objects.bulk_create(new_words, ignore_conflicts=True)
                            new_words = []

                    except (ValueError, IndexError) as e:
                        print(f"Error processing line: {line} -> {e}")

                Word.objects.bulk_create(new_words, ignore_conflicts=True)
            pbar.update(1)

except Exception as e:
    print(f"An error occurred: {e}")

pbar.close()
print("finished")





#old working
# import os
# from words.models import Word
# from tqdm import tqdm

# all_folder = r'C:\IT_projects\freestyle_app\ispell-pl-20021127\ispell-pl-20021127\all_in_one'

# all_lists = []

# # Walking through the directory
# for root, dirs, files in os.walk(all_folder):
#     for file in files:
#         # Joining the file path with root directory
#         file_path = os.path.join(root, file)
#         all_lists.append(file_path)


# # Initialize tqdm progress bar with the total number of lines as the maximum value
# pbar = tqdm(total=len(all_lists))


# for file_path in all_lists:
#     with open(file_path, 'r', encoding='iso-8859-2') as file_object:
#         # Read the lines from the file
#         lines = file_object.readlines()
#         for line in lines:
#             try:
#                 word, occurency = line.split()[0], int(line.split()[1])

#                 Word.objects.get_or_create(name=word.split('/')[0], defaults={'occurrence': occurency})
#             except (ValueError, Word.DoesNotExist, Word.MultipleObjectsReturned) as e:
#                 print(f"Error processing line: {line} -> {e}")
#     pbar.update(1)

# pbar.close()
# print("finished")