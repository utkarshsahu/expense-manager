from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from pydantic import BaseModel

class Transaction(Base):
    __tablename__ = "transaction"

    description = Column(String, primary_key=True, nullable=False)
    date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    expense_type = Column(String, nullable=False)
    category = Column(String, nullable=True)

