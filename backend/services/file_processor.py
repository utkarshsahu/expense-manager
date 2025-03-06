import pandas as pd
from io import BytesIO
import pickle
import psycopg2
from sqlalchemy import create_engine
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def load_model():
    """Retrieve and deserialize the model from PostgreSQL"""
    conn = psycopg2.connect(
        dbname="expense_manager", user="utkarsh", password="admin123", host="localhost", port="5432"
    )
    cursor = conn.cursor()

    # Fetch the latest model
    cursor.execute("SELECT model FROM models ORDER BY created_at DESC LIMIT 1")
    model_binary = cursor.fetchone()[0]

    # Deserialize the model
    model = pickle.loads(model_binary)

    cursor.close()
    conn.close()

    return model

def load_categories():
    conn = psycopg2.connect(
         dbname="expense_manager", user="utkarsh", password="admin123", host="localhost", port="5432"
     )
    cursor = conn.cursor()
    # Fetch the latest model
    cursor.execute("SELECT name FROM category;")
    categories = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()

    return categories

def gpt_categorize_transaction(description, amount, expense_type, categories):
    prompt = f"""
    Given the following transaction details:
    - Description: {description}
    - Amount: {amount}
    - Type: {expense_type} (Debit/Credit)

    Classify this transaction into one of the following categories:
    {categories}.

    Respond with only the category name.
    """

    client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use GPT-4 for better reasoning
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10  # Expecting a single-word category
        )

        category = response["choices"][0]["message"]["content"].strip()

        return category
    except Exception as e:
        return False

def process_statement(file):
    """
    Processes an uploaded Excel bank statement to extract transactions.

    Args:
        file (UploadFile): The uploaded Excel file from the API.

    Returns:
        list: A list of transaction dictionaries.
    """

    # Load Excel file into Pandas
    df = pd.read_excel(BytesIO(file.file.read()), sheet_name=0)  # Read first (only) sheet

    # Identify the row containing headers
    header_row_index = None
    expected_headers = {"Transaction Date", "Transaction Remarks", "Withdrawal Amount (INR )", "Deposit Amount (INR )"}

    for idx, row in df.iterrows():
        if expected_headers.issubset(set(row)):  # Find the first row that matches all headers
            header_row_index = idx
            break

    if header_row_index is None:
        raise ValueError("Could not locate transactions in the uploaded file.")

    # Extract transactions from the correct section
    df = df.iloc[header_row_index:].reset_index(drop=True)  # Data starts from next row
    df.columns = df.iloc[0]  # Set proper column names
    df = df[1:].reset_index(drop=True)  # Remove duplicate header row

    #model = load_model()
    categories = load_categories()
    engine = create_engine(os.getenv("DATABASE_URL"))
    # Clean and process transactions
    transactions = []
    rows_count = 0
    for _, row in df.iterrows():
        try:
            description = str(row["Transaction Remarks"]).strip()
            if description not in ('nan',None):
                category = gpt_categorize_transaction(description,
                                                       (float(row["Withdrawal Amount (INR )"] or 0) or float(row["Deposit Amount (INR )"] or 0)),
                                                       "credit" if float(row["Deposit Amount (INR )"] or 0)>0 else "debit",
                                                       categories)
                if category is False:
                    break
                transaction = {
                    "date": pd.to_datetime(row["Transaction Date"], format="%d/%m/%Y", errors="coerce"),
                    "description": str(row["Transaction Remarks"]).strip(),
                    "amount": (float(row["Withdrawal Amount (INR )"] or 0) or float(row["Deposit Amount (INR )"] or 0)),  # Normalize amount
                    "expense_type": "credit" if float(row["Deposit Amount (INR )"] or 0)>0 else "debit",
                    "category": category
                    }

                if pd.notna(transaction["date"]):  # Only keep valid rows
                    transactions.append(transaction)

                df_ins = pd.DataFrame([transaction])
                df_ins.to_sql("transaction", engine, if_exists="append", index=False)
                rows_count = rows_count + 1


        except Exception as e:
            print(str(e))
            continue  # Skip bad rows

    #df_transactions = pd.DataFrame(transactions)
    #df_transactions = df_transactions.drop_duplicates(subset=['description'], keep='first')
    #engine = create_engine(os.getenv("DATABASE_URL"))
    #try:
    #    df_transactions.to_sql("transaction", engine, if_exists="append", index=False)
    #except Exception as e:


    #print('Saved to transactions table - ', len(df_transactions.index), ' rows')

    return rows_count, transactions

