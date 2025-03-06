from fastapi import FastAPI
from database import engine, Base
from routes import transactions  # Import API routes
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI(
    title="Expense Manager API",
    description="An API to manage and categorize expenses from bank statements",
    version="1.0.0"
)

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Enable CORS (Allow frontend to communicate with backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(transactions.router, prefix="/api")

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to Expense Manager API"}

