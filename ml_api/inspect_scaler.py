import joblib

scaler = joblib.load("scaler.pkl")

print(type(scaler))

try:
    print("Features:", scaler.feature_names_in_)
except:
    print("No feature names stored")