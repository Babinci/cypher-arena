import requests
import csv
import time
from tqdm import tqdm

API_URL = "https://cypher-arena.com/api/words/contrast-pairs/"
FETCH_COUNT = 200
OUTPUT_CSV = "contrast_pairs_processed.csv"

unique_pairs = {}

for _ in tqdm(range(FETCH_COUNT), desc="Fetching pairs"):
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        data = response.json()
        for pair in data:
            pair_id = pair.get("id")
            if pair_id not in unique_pairs:
                unique_pairs[pair_id] = {
                    "id": pair_id,
                    "item1": pair.get("item1", ""),
                    "item2": pair.get("item2", "")
                }
        time.sleep(0.1)  # Be polite to the server
    except Exception as e:
        print(f"Error fetching data: {e}")

# Process: sort by id, add empty rating column, save as processed CSV
rows = list(unique_pairs.values())
rows.sort(key=lambda x: int(x["id"]))
for row in rows:
    row["rating"] = ""

fieldnames = ["id", "item1", "item2", "rating"]
with open(OUTPUT_CSV, mode="w", newline='', encoding="utf-8") as outfile:
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"Saved {len(rows)} unique pairs to {OUTPUT_CSV}")
