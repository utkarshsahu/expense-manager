from pydantic import BaseModel


class UpdateCategoryRequest(BaseModel):
    description: str
    category: str
