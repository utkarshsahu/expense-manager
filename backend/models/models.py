from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, TIMESTAMP, func
from database import Base

class Models(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String, nullable=False)
    model = Column(LargeBinary, nullable=False)  # Store model as binary (pickle format)
    created_at = Column(TIMESTAMP, server_default=func.now())  # Auto timestamp# Define the Model table
