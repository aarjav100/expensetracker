import numpy as np
from sklearn.linear_model import LinearRegression
import joblib
import os

def predict_next_month(history, income):
    """
    history: list of monthly expense totals [m1, m2, m3, ...]
    income: current monthly income
    """
    # PRD Requirement: 3-month average, feature engineering
    if len(history) < 3:
        # Fallback for new users
        prediction = history[-1] * 1.1 if history else (income * 0.7)
        return {
            "prediction": round(prediction, 2),
            "predicted_savings": round(income - prediction, 2),
            "recommendation": "Track at least 3 months of data for high-accuracy AI forecasting."
        }

    # Feature Engineering as per PRD:
    # We'll use [Last Month, 3-Month Average, Income] as features
    last_month = history[-1]
    three_month_avg = sum(history[-3:]) / 3
    
    # Target: The current month (which we have in history)
    # To train properly, we'd need a sliding window. 
    # For a simple demo service:
    # We'll simulate a training set from the history
    X_train = []
    y_train = []
    
    for i in range(3, len(history)):
        features = [history[i-1], sum(history[i-3:i])/3, income]
        X_train.append(features)
        y_train.append(history[i])
        
    if not X_train:
        # If not enough history to slide, use basic linear extrapolation
        prediction = (last_month + three_month_avg) / 2
    else:
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        # Predict next month
        current_features = np.array([[last_month, three_month_avg, income]])
        prediction = float(model.predict(current_features)[0])

    prediction = max(0, prediction)
    predicted_savings = income - prediction
    
    # Recommendations based on PRD: "Suggest reduce food if over" etc.
    if prediction > (income * 0.9):
        recommendation = "CRITICAL: You are projected to spend nearly 90% of your income. We recommend reducing non-essential spending by at least 15%."
    elif prediction > (income * 0.7):
        recommendation = "ADVISORY: Spending trend is climbing. Consider capping 'Shopping' or 'Dining' to maintain savings."
    else:
        recommendation = "HEALTHY: Your spending is well within limits. Predicted savings rate: {:.0f}%.".format((predicted_savings/income)*100 if income else 0)

    return {
        "prediction": round(prediction, 2),
        "predicted_savings": round(predicted_savings, 2),
        "recommendation": recommendation
    }
