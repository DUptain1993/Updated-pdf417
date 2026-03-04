import datetime

def format_date(date_str):
    """Expects MM/DD/YYYY or MMDDYYYY, returns MMDDYYYY"""
    return date_str.replace("/", "")

def generate_aamva_payload(data):
    # Control Characters
    LF = "\n"
    RS = "\x1e"
    CR = "\r"
    
    # Header
    iin = data.get('iin', '636000').zfill(6)
    aamva_ver = "11" # 2025 standard
    juris_ver = data.get('juris_ver', '00').zfill(2)
    num_entries = "01" # We'll start with just one 'DL' subfile
    
    header = f"@{LF}{RS}{CR}ANSI {iin}{aamva_ver}{juris_ver}{num_entries}"
    
    # Subfile 'DL'
    subfile_type = "DL"
    
    # Build DL data elements
    elements = []
    # Mandatory fields according to 2025 standard (Annex D)
    mapping = {
        'DAQ': 'customer_id',
        'DCS': 'family_name',
        'DAC': 'first_name',
        'DAD': 'middle_name',
        'DBD': 'issue_date',
        'DBB': 'dob',
        'DBA': 'expiry_date',
        'DBC': 'sex',
        'DAY': 'eye_color',
        'DAU': 'height',
        'DAG': 'street',
        'DAI': 'city',
        'DAJ': 'state',
        'DAK': 'zip',
        'DCF': 'doc_discriminator',
        'DCG': 'country',
        'DDE': 'family_name_truncation',
        'DDF': 'first_name_truncation',
        'DDG': 'middle_name_truncation',
    }
    
    # Order doesn't strictly matter for decoding but we'll follow a common order
    # Note: Each element ends with LF
    dl_data = "DL"
    for code, key in mapping.items():
        val = data.get(key, "")
        if val:
            dl_data += f"{code}{val}{LF}"
    
    # Record Separator ends the subfile
    dl_data += RS
    
    # Calculate Offset and Length
    # Header is 21 bytes
    # One subfile designator is 10 bytes
    # Total header + directory = 31 bytes
    offset = 31
    length = len(dl_data)
    
    subfile_designator = f"{subfile_type}{offset:04d}{length:04d}"
    
    payload = header + subfile_designator + dl_data
    return payload

def main():
    print("=== AAMVA 2025 PDF417 Data Generator ===")
    data = {}
    data['iin'] = input("Issuer Identification Number (IIN) [636000]: ") or "636000"
    data['customer_id'] = input("Customer ID Number (DAQ): ")
    data['family_name'] = input("Family Name (DCS): ").upper()
    data['first_name'] = input("First Names (DAC): ").upper()
    data['middle_name'] = input("Middle Names (DAD): ").upper()
    data['dob'] = format_date(input("Date of Birth (MMDDCCYY) (DBB): "))
    data['expiry_date'] = format_date(input("Expiration Date (MMDDCCYY) (DBA): "))
    data['issue_date'] = format_date(input("Issue Date (MMDDCCYY) (DBD): "))
    data['sex'] = input("Sex (1=M, 2=F, 9=U) (DBC): ")
    data['eye_color'] = input("Eye Color (3 letters, e.g., BRO, BLU) (DAY): ").upper()
    data['height'] = input("Height (e.g., 070 in or 178 cm) (DAU): ")
    data['street'] = input("Street Address (DAG): ").upper()
    data['city'] = input("City (DAI): ").upper()
    data['state'] = input("State (2 letters) (DAJ): ").upper()
    data['zip'] = input("Postal Code (DAK): ")
    data['doc_discriminator'] = input("Document Discriminator (DCF): ")
    data['country'] = input("Country (USA or CAN) (DCG): ") or "USA"
    data['family_name_truncation'] = input("Family Name Truncated? (T/N/U) (DDE) [N]: ") or "N"
    data['first_name_truncation'] = input("First Name Truncated? (T/N/U) (DDF) [N]: ") or "N"
    data['middle_name_truncation'] = input("Middle Name Truncated? (T/N/U) (DDG) [N]: ") or "N"

    payload = generate_aamva_payload(data)
    
    filename = "aamva_2025_payload.bin"
    with open(filename, "wb") as f:
        f.write(payload.encode("iso-8859-1"))
    
    print(f"\nPayload generated and saved to {filename}")
    print("You can use 'zint' to generate the barcode from this file:")
    print(f"zint --barcode=55 --input={filename} --output=barcode.png")

if __name__ == "__main__":
    main()
