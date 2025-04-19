import csv

INPUT_CSV = "contrast_pairs.csv"
OUTPUT_CSV = "contrast_pairs_processed.csv"

rows = []

with open(INPUT_CSV, mode="r", encoding="utf-8") as infile:
    reader = csv.DictReader(infile)
    for row in reader:
        row["id"] = int(row["id"])  # Ensure id is int for sorting
        rows.append(row)

rows.sort(key=lambda x: x["id"])

for row in rows:
    row["rating"] = ""  # Add empty rating column

fieldnames = ["id", "item1", "item2", "rating"]

with open(OUTPUT_CSV, mode="w", newline='', encoding="utf-8") as outfile:
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"Processed CSV saved as {OUTPUT_CSV}")
