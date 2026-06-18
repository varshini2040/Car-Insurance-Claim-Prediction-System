"""
Diagnostic script to check pkl file integrity and load compatibility
"""

import os
import pickle
import struct

def check_file_header(filepath):
    """Check if file is a valid pickle"""
    try:
        with open(filepath, 'rb') as f:
            first_bytes = f.read(10)
            print(f"  First bytes (hex): {first_bytes.hex()}")
            print(f"  First bytes (repr): {repr(first_bytes)}")
            
            # Valid pickle formats start with specific bytes
            if first_bytes[0:1] == b'\x80':  # Protocol
                print(f"  ✅ Looks like a valid pickle (protocol {first_bytes[1]})")
                return True
            elif first_bytes[0:2] == b'PK':  # Zip file
                print(f"  ℹ️  Looks like a ZIP/Joblib file")
                return True
            else:
                print(f"  ❌ Doesn't look like a valid pickle file")
                return False
    except Exception as e:
        print(f"  ❌ Error reading file: {e}")
        return False

def try_load_with_pickle(filepath):
    """Try loading with standard pickle"""
    try:
        with open(filepath, 'rb') as f:
            obj = pickle.load(f)
            print(f"  ✅ Loaded with pickle.load()")
            print(f"     Object type: {type(obj).__name__}")
            return True
    except Exception as e:
        print(f"  ❌ pickle.load() failed: {e}")
        return False

def try_load_with_joblib(filepath):
    """Try loading with joblib"""
    try:
        import joblib
        obj = joblib.load(filepath)
        print(f"  ✅ Loaded with joblib.load()")
        print(f"     Object type: {type(obj).__name__}")
        return True
    except Exception as e:
        print(f"  ❌ joblib.load() failed: {e}")
        return False

# Check all pkl files
ml_api_dir = os.path.dirname(os.path.abspath(__file__))
pkl_files = [
    'best_insurance_model.pkl',
    'scaler.pkl',
    'label_encoder_gender.pkl',
    'label_encoder_vehicle.pkl'
]

print("=" * 60)
print("🔍 PKL File Diagnostic Report")
print("=" * 60)
print()

for pkl_file in pkl_files:
    filepath = os.path.join(ml_api_dir, pkl_file)
    print(f"📄 {pkl_file}")
    print("-" * 60)
    
    if not os.path.exists(filepath):
        print(f"  ❌ FILE NOT FOUND")
        print()
        continue
    
    # Check file size
    file_size = os.path.getsize(filepath)
    print(f"  📊 File size: {file_size} bytes")
    
    # Check header
    print(f"  🔎 Checking file header...")
    check_file_header(filepath)
    
    # Try pickle
    print(f"  🔄 Trying pickle.load()...")
    pickle_ok = try_load_with_pickle(filepath)
    
    # Try joblib if pickle fails
    if not pickle_ok:
        print(f"  🔄 Trying joblib.load()...")
        try_load_with_joblib(filepath)
    
    print()

print("=" * 60)
print("📋 SUMMARY")
print("=" * 60)
print("If files show as ZIP/Joblib, use: import joblib; model = joblib.load()")
print("If files show errors, they may be corrupted - consider re-exporting them")
print()
