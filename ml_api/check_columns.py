import pandas as pd

df = pd.read_csv(r"E:\PROJECTS\car\Dataset\car_insurance_dataset.csv")

print(df.columns.tolist())
print("\nShape:", df.shape)