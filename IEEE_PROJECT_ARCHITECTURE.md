# Image-Based Car Insurance Claim Verification Architecture

## 1. System objective

The system verifies identity from uploaded image pairs. It does not compare manually
entered vehicle or driver-license numbers.

```text
React claim form
      |
      | multipart/form-data (claim fields + 3 claim images)
      v
Express claim API
      |
      |-- finds insurance application by userId + policyNumber
      |-- loads 3 insurance reference images
      |-- sends ML fields + 6 images
      v
Flask /analyze-claim
      |
      |-- Random Forest fraud probability
      |-- TensorFlow MobileNetV2 image embeddings
      |     |-- insurance vehicle <-> accident vehicle
      |     |-- insurance plate   <-> current plate
      |     `-- insurance license <-> current license
      |
      `-- weighted final decision engine
              |
              v
MongoDB Claim analysis snapshot
              |
              v
React user result + admin detection report
```

## 2. Image similarity method

Each image is resized to `224 x 224`, preprocessed using the selected ImageNet model,
and passed through MobileNetV2 without its classification head. Global average pooling
produces an embedding vector. Cosine similarity is calculated between the insurance
embedding and claim embedding:

```text
similarity = (A dot B) / (norm(A) * norm(B))
similarity percentage = similarity * 100
```

The default model is MobileNetV2. Set `IMAGE_MODEL=ResNet50` before starting Flask to
use ResNet50 instead.

Default thresholds:

| Verification | Match threshold |
|---|---:|
| Vehicle | 72% |
| Number plate image | 78% |
| Driver license image | 78% |

Thresholds can be changed with `VEHICLE_MATCH_THRESHOLD`,
`PLATE_MATCH_THRESHOLD`, and `LICENSE_MATCH_THRESHOLD` using decimal values.

## 3. Decision engine

Image similarity is converted to mismatch risk (`100 - similarity`). The final score is:

```text
Final Risk =
  0.55 * Fraud Probability
  + 0.20 * Vehicle Mismatch Risk
  + 0.15 * Plate Mismatch Risk
  + 0.10 * License Mismatch Risk
```

Decision rules:

| Condition | Final status | Recommendation |
|---|---|---|
| Score >= 70 | Critical Risk | Reject and escalate to fraud investigation |
| Score >= 40 or any image mismatch | Manual Review | Hold and manually verify documents |
| Otherwise | Low Risk | Proceed with normal claim processing |

These weights and thresholds are explainable project parameters, not learned clinical or
legal rules. They should be calibrated against a labeled validation dataset before a
production deployment.

## 4. Flask API

### `POST /analyze-claim`

Multipart fields:

- Ten Random Forest input fields.
- `insurance_vehicle`, `claim_vehicle`
- `insurance_plate`, `claim_plate`
- `insurance_license`, `claim_license`

Response sections:

- `fraud_detection`
- `image_verification.vehicle`
- `image_verification.plate`
- `image_verification.license`
- `final_decision`

### Other endpoints

- `POST /predict`: Random Forest-only JSON prediction.
- `POST /verify-vehicle`: generic two-image comparison.
- `GET /health`: model and threshold status.

## 5. MongoDB changes

`InsuranceApplication` stores reference filenames:

- `vehicleFront`
- `vehicleNumberPlate`
- `licenseFront`

`Claim` stores:

- Three claim image filenames.
- Fraud prediction, probability, risk level, and model.
- Three nested comparison objects containing similarity, threshold, match, and model.
- Final risk score, final status, recommendation, weights, and analysis timestamp.
- A reference to the source insurance application.

The stored values form an audit snapshot. Opening the admin report does not rerun the
model or substitute demonstration values.

## 6. Run order

```powershell
cd ml_api
pip install -r requirements.txt
python app.py

cd ../backend
npm install
npm start

cd ..
npm install
npm start
```

Services:

- React: `http://localhost:3000`
- Express: `http://localhost:5000`
- Flask: `http://127.0.0.1:5001`

## 7. IEEE evaluation plan

Report separate metrics for each subsystem:

- Random Forest: accuracy, precision, recall, F1, ROC-AUC, and confusion matrix.
- Image matching: genuine/impostor similarity distributions, ROC curve, equal-error
  rate, false acceptance rate, and false rejection rate.
- End-to-end engine: confusion matrix for Low Risk, Manual Review, and Critical Risk.
- Performance: average embedding time and complete claim-analysis latency.

Use train/validation/test separation by vehicle or customer identity to prevent images
of the same identity leaking across evaluation splits.

## 8. Security and production notes

- Add JWT authorization to claim/admin routes.
- Store images in private object storage rather than a public uploads directory.
- Encrypt identity documents, add retention rules, and record administrator access.
- Add file-signature validation, malware scanning, rate limits, and request logging.
- Calibrate thresholds on representative lighting, camera, angle, damage, and document
  conditions. ImageNet embeddings are a defensible final-year baseline, not a guarantee
  of real-world identity.
