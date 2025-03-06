from database import engine, Base
from models.transaction import Transaction
from models.models import Models
from models.category import Category

Base.metadata.create_all(bind=engine)
print("✅ Database tables created successfully!")
