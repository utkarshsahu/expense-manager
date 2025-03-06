from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models.transaction import Transaction
from models.update_request import UpdateCategoryRequest
from database import Base, get_db



def update_expense_category(body: UpdateCategoryRequest, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.description == body.description).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction.category = body.category
    db.commit()
    db.refresh(transaction)

    return {"message": "Category updated successfully",  "new_category": body.category}
