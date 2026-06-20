const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const Claim = require("../models/Claim");
const Insurance = require("../models/InsuranceApplication");

const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:5001";
const uploadPath = (filename) =>
  path.resolve(__dirname, "..", "uploads", filename || "");

const claimWithCustomer = (claim) => {
  const data = typeof claim?.toObject === "function" ? claim.toObject() : claim;
  if (!data) return data;

  return {
    ...data,
    userName: data.userName || data.userId?.name || "",
    userEmail: data.userEmail || data.userId?.email || "",
  };
};

const appendImage = (form, field, filename) => {
  const absolutePath = uploadPath(filename);
  if (!filename || !fs.existsSync(absolutePath)) {
    throw new Error(`Required reference image is unavailable: ${field}`);
  }
  form.append(field, fs.createReadStream(absolutePath));
};

const appendOptionalImage = (form, field, filename) => {
  const absolutePath = uploadPath(filename);
  if (filename && fs.existsSync(absolutePath)) {
    form.append(field, fs.createReadStream(absolutePath));
    return true;
  }
  return false;
};

const sameUploadFile = (first, second) =>
  Boolean(first && second && String(first) === String(second));

exports.submitClaim = async (req, res) => {
  try {
    const {
      userId,
      policyNumber,
      licensePlate,
      accidentDate,
      accidentLocation,
      damageType,
      driverAtFault,
      weather,
      describeAccident,
      estimatedCost,
      claimAmount,
      age,
      gender,
      vehicleAge,
      vehicleType,
      annualPremium,
      drivingExperience,
      accidentHistory,
      claimHistory,
      creditScore,
      policyDuration,
    } = req.body;

    if (!userId || !policyNumber) {
      return res.status(400).json({ success: false, message: "User and policy are required." });
    }

    const claimFiles = {
      carImage: req.files?.carImage?.[0]?.filename,
      plateImage: req.files?.plateImage?.[0]?.filename,
      licenseImage: req.files?.licenseImage?.[0]?.filename,
    };
    if (Object.values(claimFiles).some((filename) => !filename)) {
      return res.status(400).json({
        success: false,
        message: "Accident car, number plate, and driver license images are required.",
      });
    }

    const insurance = await Insurance.findOne({ policyNumber, userId }).sort({ submittedAt: -1 });
    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "No insurance application was found for this policy.",
      });
    }

    // Do NOT run ML detection during user submission.
    // Admin must click "Detect" to generate the full fraud report.

    const newClaim = await Claim.create({
      userId,
      insuranceApplicationId: insurance._id,
      policyNumber,
      licensePlate,
      accidentDate,
      accidentLocation,
      damageType,
      driverAtFault: driverAtFault || "Not Provided",
      weather: weather || "Not Provided",
      describeAccident: describeAccident || "Not Provided",
      estimatedCost: Number(estimatedCost) || 0,
      claimAmount: Number(claimAmount) || 0,
      age,
      gender,
      vehicleAge,
      vehicleType,
      annualPremium,
      drivingExperience,
      accidentHistory,
      claimHistory,
      creditScore,
      policyDuration,
      ...claimFiles,
      status: "Under Review",
      verificationStatus: "Not Detected",
    });

    return res.status(201).json({
      success: true,
      message: "Claim submitted successfully.",
      claim: newClaim,
    });
  } catch (error) {
    console.error("Claim submission error:", error.response?.data || error.message);
    const upstreamStatus = error.response?.status;
    return res.status(upstreamStatus && upstreamStatus < 500 ? upstreamStatus : 500).json({
      success: false,
      message: error.response?.data?.error || error.message || "Claim submission failed.",
    });
  }
};

exports.getAllClaims = async (_req, res) => {
  try {
    const claims = await Claim.find()
      .populate("userId", "name email")
      .populate("insuranceApplicationId")
      .sort({ createdAt: -1 });
    res.json(claims.map(claimWithCustomer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("userId", "name email")
      .populate("insuranceApplicationId");

    if (!claim) return res.status(404).json({ message: "Claim not found." });
    res.json({ claim: claimWithCustomer(claim) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const allowed = ["Submitted", "Under Review", "Approved", "Rejected"];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid claim status." });
    }
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("userId", "name email");
    if (!claim) return res.status(404).json({ message: "Claim not found." });
    res.json({ message: "Claim status updated.", claim: claimWithCustomer(claim) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ claims });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// ADMIN: Detect Fraud + Generate Full Report
// ============================
exports.detectClaim = async (req, res) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findById(claimId)
      .populate("insuranceApplicationId")
      .populate("userId", "name email");

    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const insurance = claim.insuranceApplicationId;
    if (!insurance) {
      return res
        .status(404)
        .json({ success: false, message: "Insurance application for this claim was not found." });
    }

    // Build analysis payload (same as previous submitClaim logic)
    const analysisForm = new FormData();
    [
      ["age", claim.age],
      ["gender", claim.gender],
      ["vehicle_age", claim.vehicleAge],
      ["vehicle_type", claim.vehicleType],
      ["annual_premium", claim.annualPremium],
      ["driving_experience", claim.drivingExperience],
      ["accident_history", claim.accidentHistory],
      ["claim_history", claim.claimHistory],
      ["credit_score", claim.creditScore],
      ["policy_duration", claim.policyDuration],
    ].forEach(([key, value]) => analysisForm.append(key, value ?? ""));

    analysisForm.append("insurance_plate_number", insurance.licensePlate || "");
    analysisForm.append("claim_license_plate", claim.licensePlate || "");
    analysisForm.append(
      "plate_pair_same_file",
      sameUploadFile(insurance.vehicleNumberPlate, claim.plateImage) ? "true" : "false"
    );

    const vehicleReferenceCount = [
      ["insurance_vehicle_front", insurance.vehicleFront],
      ["insurance_vehicle_back", insurance.vehicleBack],
      ["insurance_vehicle_side", insurance.vehicleSide],
    ].filter(([field, filename]) => appendOptionalImage(analysisForm, field, filename)).length;

    if (!vehicleReferenceCount) {
      appendImage(analysisForm, "insurance_vehicle", insurance.vehicleFront);
    }

    appendImage(analysisForm, "claim_vehicle", claim.carImage);
    appendImage(analysisForm, "insurance_plate", insurance.vehicleNumberPlate);
    appendImage(analysisForm, "claim_plate", claim.plateImage);
    appendImage(analysisForm, "insurance_license", insurance.licenseFront);
    appendImage(analysisForm, "claim_license", claim.licenseImage);

    const analysisResponse = await axios.post(
      `${ML_API_URL}/analyze-claim`,
      analysisForm,
      {
        headers: analysisForm.getHeaders(),
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    const analysis = analysisResponse.data;
    const fraud = analysis.fraud_detection;
    const verification = analysis.image_verification;
    const plateOcr = analysis.plate_ocr;
    const licenseOcr = analysis.license_ocr;
    const decision = analysis.final_decision;
    const fileWarnings = [];

    if (sameUploadFile(insurance.vehicleNumberPlate, claim.plateImage)) {
      fileWarnings.push(
        "Insurance plate image and claim plate image use the same uploaded file."
      );
    }

    const updatedClaim = await Claim.findByIdAndUpdate(
      claimId,
      {
        prediction: fraud.prediction,
        predictionResult:
          fraud.prediction_label === "Fraud" ? "Fraud Claim" : "Genuine Claim",
        fraudProbability: fraud.fraud_probability,
        fraudRisk: fraud.risk_level,
        modelUsed: fraud.model_used,
        imageVerification: verification,
        plateOcr: {
          insuredPlate: plateOcr?.insured_plate,
          insuranceImagePlate: plateOcr?.insurance_image_plate,
          detectedPlate: plateOcr?.detected_plate,
          submittedClaimPlate: plateOcr?.submitted_claim_plate,
          matchPercentage: plateOcr?.match_percentage,
          mismatchReasons: plateOcr?.mismatch_reasons || [],
          success: plateOcr?.success,
          error: plateOcr?.error,
        },
        licenseOcr: {
          insuredLicense: licenseOcr?.insured_license,
          detectedLicense: licenseOcr?.detected_license,
          insuredName: licenseOcr?.insured_name,
          detectedName: licenseOcr?.detected_name,
          insuredDob: licenseOcr?.insured_dob,
          detectedDob: licenseOcr?.detected_dob,
          matchPercentage: licenseOcr?.match_percentage,
          success: licenseOcr?.success,
          error: licenseOcr?.error,
        },
        vehicleSimilarity: verification.vehicle.similarity,
        plateSimilarity: verification.plate.similarity,
        licenseSimilarity: verification.license.similarity,
        overallRiskScore: decision.overall_risk_score,
        finalStatus: decision.final_status,
        recommendedAction: decision.recommended_action,
        decisionWeights: decision.weights,
        verificationStatus: "Verified",
        analyzedAt: new Date(),
        status: "Under Review",
      },
      { new: true }
    ).populate("userId", "name email");

    return res.status(200).json({
      success: true,
      message: "Claim detection report generated.",
      claim: claimWithCustomer(updatedClaim),
      detectionReport: {
        ...analysis,
        license_ocr: licenseOcr,
        reference_images: {
          insurance_vehicle: insurance.vehicleFront,
          insurance_vehicle_front: insurance.vehicleFront,
          insurance_vehicle_back: insurance.vehicleBack,
          insurance_vehicle_side: insurance.vehicleSide,
          claim_vehicle: claim.carImage,
          insurance_plate: insurance.vehicleNumberPlate,
          claim_plate: claim.plateImage,
          insurance_license: insurance.licenseFront,
          claim_license: claim.licenseImage,
        },
        file_warnings: fileWarnings,
        policy_holder: {
          name: claim.userName || claim.userId?.name,
          email: claim.userEmail || claim.userId?.email,
          policy_number: claim.policyNumber,
          insurance_plate: insurance.licensePlate,
          claim_license_plate: claim.licensePlate,
          claim_amount: claim.claimAmount,
          vehicle_type: claim.vehicleType,
        },
      },
    });
  } catch (error) {
    console.error("Detect claim error:", error.response?.data || error.message);
    const upstreamStatus = error.response?.status;
    return res
      .status(upstreamStatus && upstreamStatus < 500 ? upstreamStatus : 500)
      .json({
        success: false,
        message: error.response?.data?.error || error.message || "Detection failed.",
      });
  }
};
