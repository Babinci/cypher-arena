import os
from contrasting_mode.models import ContrastPair
import json

def load_data_from_json(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return {item['pk']: 
            {'item1': item['fields']['item1'], 
             'item2': item['fields']['item2'], 
             'rating': item['fields']['rating']} 
            for item in data}

def sync_contrast_pairs(dev_data_path):
    # Load dev data from the JSON file
    dev_pairs = load_data_from_json(dev_data_path)

    # Fetch all ContrastPairs from prod
    prod_pairs = {cp.id: {'item1': cp.item1, 'item2': cp.item2, 'rating': cp.rating} 
                  for cp in ContrastPair.objects.all()}

    # Update existing pairs and add new ones
    for dev_id, dev_data in dev_pairs.items():
        dev_item1, dev_item2, dev_rating = dev_data['item1'], dev_data['item2'], dev_data['rating']

        if dev_id in prod_pairs:
            # Existing pair found in prod
            prod_data = prod_pairs[dev_id]
            prod_item1, prod_item2, prod_rating = prod_data['item1'], prod_data['item2'], prod_data['rating']
            
            # Check if names are different, update if necessary
            if dev_item1 != prod_item1 or dev_item2 != prod_item2:
                ContrastPair.objects.filter(id=dev_id).update(item1=dev_item1, item2=dev_item2)
                print(f"Updated names for pair {prod_item1} - {prod_item2} to {dev_item1} - {dev_item2}")

            # Check if rating needs updating
            if (prod_rating is None or prod_rating != dev_rating) and dev_rating is not None:
                ContrastPair.objects.filter(id=dev_id).update(rating=dev_rating)
                print(f"Updated rating for {dev_item1} - {dev_item2}: {prod_rating} -> {dev_rating}")

        else:
            # Add new pairs from dev to prod
            ContrastPair.objects.create(item1=dev_item1, item2=dev_item2, rating=dev_rating)
            print(f"Added new pair: {dev_item1} - {dev_item2} with rating {dev_rating}")

    print("Synchronization completed.")

if __name__ == "__main__":
    # Use relative path from script location
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dev_data_path = os.path.join(current_dir, '../db_dumpdata/dev_contrast_pairs.json')
    
    sync_contrast_pairs(dev_data_path)