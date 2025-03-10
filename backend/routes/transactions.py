from fastapi import APIRouter, Depends, File, UploadFile, Query, HTTPException
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import extract
from database import get_db
from models.transaction import Transaction
from models.update_request import UpdateCategoryRequest
from models.category import Category
from services.file_processor import process_statement
from services.update_category import update_expense_category
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class TransactionSchema(BaseModel):
    date: date
    description: str
    amount: float
    expense_type: str
    category: str

    class Config:
        from_attributes = True  # Ensures compatibility with SQLAlchemy models


class CategoryCreate(BaseModel):
    name: str

@router.get("/transactions/", response_model=List[TransactionSchema])
def get_transactions(
    page: int = Query(0, alias="page", ge=0),
    size: Optional[int] = Query(None, alias="size", ge=1),
    month: Optional[int] = Query(None, alias="month", ge=1, le=12),
    year: Optional[int] = Query(None, alias="year", ge=2000),
    expense_type: str = Query("debit", alias="expense_type"),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)

    query = query.filter(Transaction.expense_type == expense_type)

    # Apply filtering if month and year are provided
    if month and year:
        query = query.filter(
            extract("month", Transaction.date) == month,
            extract("year", Transaction.date) == year,
        )

    transactions = query.order_by(Transaction.date.desc()).offset(page * (0 if size is None else size)).limit(size).all()
    return transactions

@router.post("/upload-statement/")
async def upload_statement(file: UploadFile = File(...)):
    transactions_added, transactions = process_statement(file)
    return {"count": transactions_added, "transactions": transactions}


@router.put("/update-category")
def update_expense_category(body: UpdateCategoryRequest, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.description == body.description).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.category = body.category
    db.commit()
    db.refresh(transaction)

    return {"message": "Category updated successfully",  "new_category": body.category}


@router.post("/add-category", response_model=CategoryCreate)
def add_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.name == category.name).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories

@router.delete("/delete-category")
def delete_category(category: CategoryCreate, db: Session = Depends(get_db)):
    # Find the category
    category = db.query(Category).filter(Category.name == category.name).first()

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Delete the category
    db.delete(category)
    db.commit()

    return {"message": "Category deleted successfully"}
