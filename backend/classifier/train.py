import pandas as pd
import psycopg2
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Sample training data (replace with real dataset)

# Convert to DataFrame
df = pd.read_csv("categories_training.csv")
df = df.rename(columns={"Transaction Remarks": "description", "Category": "category"})
df["category"] = df["category"].fillna("Uncategorized")

print(df.head(), df.columns)

# Split data
X_train, X_test, y_train, y_test = train_test_split(df["description"], df["category"], test_size=0.2, random_state=42)

# Create NLP model pipeline (TF-IDF + Logistic Regression)
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),  # Convert text to numerical vectors
    ("clf", LogisticRegression())  # Train classifier
])

# Train the model
pipeline.fit(X_train, y_train)

# Serialize the model using pickle
model_binary = pickle.dumps(pipeline)

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="expense_manager", user="utkarsh", password="admin123", host="localhost", port="5432"
)
cursor = conn.cursor()

# Insert the serialized model into the database
cursor.execute("INSERT INTO models (model_name, model) VALUES (%s, %s)", ("transaction_classifier", model_binary))

# Commit & close connection
conn.commit()
cursor.close()
conn.close()

print("Model saved to PostgreSQL successfully!")
