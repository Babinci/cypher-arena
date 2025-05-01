## endpoints to modify:

GET
/words/agent/contrast-pairs/   - increase max count in pagination to 2000 and add optional ?random=true&vector_embedding=true

with random=true  - it means that it is returning in random order
with vector_embedding=true  it means that it is including also vector_embedding from model

GET
/words/agent/topics/   - increase max count in pagination to 5000 and add optional ?random=true&vector_embedding=true

with random=true  - it means that it is returning in random order
with vector_embedding=true  it means that it is including also vector_embedding from model

GET
/words/agent/news/  <-- get without date (order by last added), for now without start date and end date- i cant get data


PATCH
/words/agent/topics/  <--- i also want to be able to update  vector_embedding



## endpoint to add: 


PATCH  
/words/agent/contrast-pairs/   <--- batch update pairs (available fields to update: item1, item2, vector_embedding)


POST 
/words/agent/news/  <-- to insert for CypherArenaPerplexityDeepResearch model