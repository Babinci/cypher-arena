from pydantic import BaseModel

class Topic(BaseModel):
    topics_list: list[str]