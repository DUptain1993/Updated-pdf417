#!/usr/bin/env bash
set -euo pipefail

# AAMVA 2025 PDF417 Generator Wrapper

# Check for dependencies
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is required."
    exit 1
fi

if ! command -v zint &> /dev/null; then
    echo "Warning: 'zint' not found. Barcode image will not be generated."
    echo "Install it with: pkg install zint (on Termux) or sudo apt install zint (on Debian/Ubuntu)"
fi

# Run the interactive data generator
python3 aamva_2025.py

# Check if the payload was generated
PAYLOAD_FILE="aamva_2025_payload.bin"
if [[ -f "$PAYLOAD_FILE" ]]; then
    echo "Payload file found: $PAYLOAD_FILE"
    
    if command -v zint &> /dev/null; then
        echo "Generating PDF417 barcode image (barcode.png)..."
        # --barcode=55 is PDF417
        # --scale=2 for better quality
        # --secure=3 for Error Correction Level 3 (minimum required by AAMVA)
        zint --barcode=55 --secure=3 --input="$PAYLOAD_FILE" --output=barcode.png --scale=2
        echo "Barcode image 'barcode.png' generated."
    fi
else
    echo "Error: Payload generation failed."
    exit 1
fi
