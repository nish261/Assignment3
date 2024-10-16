from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI()

# Load datasets
property_sales_df = pd.read_csv('Property_sales.csv')
kaggle_df = pd.read_csv('Kaggle_dataset.csv')
open_portal_df = pd.read_csv('Open_Portal.csv')

# Preprocess data and train model
def train_model():
    model = LinearRegression()

    # Replace '-' with NaN and convert columns to numeric
    property_sales_df.replace("-", np.nan, inplace=True)
    
    # Features will be the Locality and year columns, and target is the price in a specific year
    features = ['Locality']  # Using Locality for prediction along with the year columns
    years = [str(year) for year in range(2013, 2024)]  # All year columns from 2013 to 2023
    target = '2023'  # We will predict for the year 2023 for now

    # Drop rows with missing values in both X and y to ensure consistency
    data = property_sales_df[['Locality'] + years + [target]].dropna()

    # Separate features (X) and target (y)
    X = data[['Locality'] + years]
    y = data[target]

    # One-hot encoding for Locality (categorical feature)
    X = pd.get_dummies(X, columns=['Locality'])

    # Train the model
    model.fit(X, y)
    return model

# Train the model
model = train_model()

# API to handle predictions
@app.post("/predict")
async def predict(locality: str, year: int):
    try:
        # Make sure the requested year is available in the dataset
        year_str = str(year)
        if year_str not in property_sales_df.columns:
            raise HTTPException(status_code=404, detail="Year data not available")
        
        # Prepare input data for prediction
        input_data = pd.DataFrame({'Locality': [locality]})
        input_data = pd.get_dummies(input_data, columns=['Locality'])
        
        for locality_column in model.feature_names_in_:
            if locality_column not in input_data.columns:
                input_data[locality_column] = 0  # Add missing columns from the dummy encoding

        prediction = model.predict(input_data)
        return {"predicted_price": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# API to get data from datasets
@app.get("/data/{dataset_name}")
async def get_data(dataset_name: str):
    if dataset_name == "property_sales":
        return property_sales_df.to_dict(orient="records")
    elif dataset_name == "kaggle":
        return kaggle_df.to_dict(orient="records")
    elif dataset_name == "open_portal":
        return open_portal_df.to_dict(orient="records")
    else:
        raise HTTPException(status_code=404, detail="Dataset not found")

