import pandas as pd

# Load Excel file
file_path = "./data/Jan.xls"  # Replace with your file path
xls = pd.ExcelFile(file_path)  # Load the Excel file

# Get list of sheet names
sheet_names = xls.sheet_names

# Display sheet names
print("Sheets in the Excel file:", sheet_names)

