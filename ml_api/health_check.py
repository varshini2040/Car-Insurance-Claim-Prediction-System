"""
Health Check Script for ML Models (JOBLIB)
Verifies that all joblib files are present and loadable
Run this before starting the main app.py
"""

import os
import joblib
import sys

def check_models():
    """Check if all required model files exist and are loadable"""
    
    print("=" * 50)
    print("🔍 ML Model Health Check")
    print("=" * 50)
    print()
    
    # Current directory IS the ml_api folder, files are here
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"📁 Model Directory: {current_dir}")
    print()
    
    # List of required model files
    required_models = [
        'best_insurance_model.pkl'
    ]
    
    optional_files = [
        'scaler.pkl',
        'label_encoder_gender.pkl',
        'label_encoder_vehicle.pkl'
    ]
    
    all_files_found = True
    models_loaded = 0
    
    # Check required models
    print("📊 Required Models:")
    print("-" * 50)
    for model_file in required_models:
        model_path = os.path.join(current_dir, model_file)
        if os.path.exists(model_path):
            try:
                model = joblib.load(model_path)
                print(f"✅ {model_file:<35} [OK]")
                print(f"   Type: {type(model).__name__}")
                models_loaded += 1
            except Exception as e:
                print(f"❌ {model_file:<35} [ERROR]")
                print(f"   Error: {str(e)}")
                all_files_found = False
        else:
            print(f"❌ {model_file:<35} [NOT FOUND]")
            all_files_found = False
    
    print()
    
    # Check optional files
    print("📦 Optional Files:")
    print("-" * 50)
    optional_found = 0
    for optional_file in optional_files:
        optional_path = os.path.join(current_dir, optional_file)
        if os.path.exists(optional_path):
            try:
                obj = joblib.load(optional_path)
                print(f"✅ {optional_file:<35} [OK]")
                print(f"   Type: {type(obj).__name__}")
                optional_found += 1
            except Exception as e:
                print(f"⚠️  {optional_file:<35} [ERROR]")
                print(f"   Error: {str(e)}")
        else:
            print(f"⚠️  {optional_file:<35} [NOT FOUND]")
    
    print()
    print("=" * 50)
    print("📋 Summary:")
    print("=" * 50)
    print(f"Required Models Found: {models_loaded}/{len(required_models)}")
    print(f"Optional Files Found: {optional_found}/{len(optional_files)}")
    print()
    
    if not all_files_found:
        print("❌ ERROR: Some required models are missing!")
        print()
        print("Required files:")
        for model_file in required_models:
            print(f"  - {model_file}")
        print()
        print(f"Expected location: {current_dir}")
        print()
        return False
    else:
        print("✅ All required models are present and loadable!")
        if optional_found > 0:
            print(f"✨ Additional {optional_found} optional file(s) loaded for enhanced preprocessing")
        print()
        print("🚀 Ready to start ML API!")
        print()
        return True

if __name__ == '__main__':
    success = check_models()
    sys.exit(0 if success else 1)
