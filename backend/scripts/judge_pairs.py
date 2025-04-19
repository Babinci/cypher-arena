import pandas as pd
import os

def get_unrated_pairs(file_path, num_pairs=20):
    df = pd.read_csv(file_path)
    unrated_pairs = df[df['rating'].isnull()]
    return df, unrated_pairs.head(num_pairs)

def main():
    file_path = os.path.join(os.path.dirname(__file__), 'contrast_pairs_processed.csv')
    file_path = os.path.abspath(file_path)
    if not os.path.exists(file_path):
        print(f"CSV file not found: {file_path}")
        return

    df, pairs = get_unrated_pairs(file_path)

    if pairs.empty:
        print("No unrated pairs available.")
        return

    print(f"Rating next {len(pairs)} unrated pairs:")
    for idx, row in pairs.iterrows():
        # Display all columns except 'rating'
        display = {col: row[col] for col in row.index if col != 'rating'}
        print(f"\nPair #{idx}:")
        for k, v in display.items():
            print(f"  {k}: {v}")
        while True:
            rating = input("Enter your rating (1-5): ").strip()
            if rating in {'1', '2', '3', '4', '5'}:
                df.at[idx, 'rating'] = int(rating)
                break
            else:
                print("Invalid input. Please enter a number between 1 and 5.")

    df.to_csv(file_path, index=False)
    print("\nRatings saved successfully.")

if __name__ == "__main__":
    main()
