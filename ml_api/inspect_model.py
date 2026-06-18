import joblib

model = joblib.load("best_insurance_model.pkl")

print("Number of features:", model.n_features_in_)

try:
    print("Classes:", model.classes_)
except:
    pass

print("Model:", type(model))