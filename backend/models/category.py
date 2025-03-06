from sqlalchemy import Column, Integer, String
from database import Base

class Category(Base):
    __tablename__ = "category"

    name = Column(String, primary_key=True, index=True, nullable=False)
