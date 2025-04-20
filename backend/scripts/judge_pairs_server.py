from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
import pandas as pd
import os
import math

app = FastAPI()
CSV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'contrast_pairs_processed.csv'))

class Rating(BaseModel):
    id: int = Field(..., description="The ID of the pair from the CSV.")
    rating: int = Field(..., ge=1, le=10, description="The rating for the pair (1-10).")

@app.get("/next_batch")
def get_next_batch():
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="CSV file not found.")
    df = pd.read_csv(CSV_PATH)
    unrated = df[df['rating'].isnull()].head(10)
    # Convert NaN to None for JSON serialization
    result = []
    for row in unrated.to_dict(orient='records'):
        row['rating'] = None if (('rating' in row) and (row['rating'] is None or (isinstance(row['rating'], float) and math.isnan(row['rating'])))) else row['rating']
        result.append(row)
    return {"batch": result}

@app.post("/rate")
def rate_batch(ratings: List[Rating]):
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="CSV file not found.")
    if len(ratings) > 10:
        raise HTTPException(status_code=400, detail="You can rate up to 10 pairs at a time.")
    df = pd.read_csv(CSV_PATH)
    id_set = set(df['id'])
    for r in ratings:
        if r.id not in id_set:
            raise HTTPException(status_code=400, detail=f"ID {r.id} not found in CSV.")
        idx = df.index[df['id'] == r.id][0]
        df.at[idx, 'rating'] = r.rating
    df.to_csv(CSV_PATH, index=False)
    return {"success": True, "rated": [r.id for r in ratings]}
