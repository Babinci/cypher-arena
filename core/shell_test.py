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