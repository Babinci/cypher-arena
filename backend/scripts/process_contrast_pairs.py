import csv

INPUT_FILE = 'contrast_pairs_processed.csv'
OUTPUT_FILE = 'contrast_pairs_filtered.csv'

with open(INPUT_FILE, newline='', encoding='utf-8') as infile, \
     open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
    writer.writeheader()
    for row in reader:
        try:
            if float(row['rating']) >= 8:
                writer.writerow(row)
        except (ValueError, KeyError):
            continue
