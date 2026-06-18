import requests

data = {
    "age": 35,
    "gender": "Male",
    "vehicleType": "SUV",
    "vehicleAge": 5,
    "annualPremium": 25000,
    "drivingExperience": 10,
    "accidentHistory": 1,
    "claimHistory": 0,
    "creditScore": 750,
    "policyDuration": 24
}

response = requests.post(
    "http://localhost:5001/predict",
    json=data
)

print(response.json())