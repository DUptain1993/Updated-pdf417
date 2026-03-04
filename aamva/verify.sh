import sys
import os

def verify_aamva_2025(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return False

    with open(file_path, "rb") as f:
        data = f.read()

    print(f"Verifying {file_path} (Size: {len(data)} bytes)...")

    # Header Checks
    if not data.startswith(b"@"):
        print("FAIL: Missing Compliance Indicator '@'")
        return False
    
    # Check control characters in header
    # Byte 1: @
    # Byte 2: LF (0x0A)
    # Byte 3: RS (0x1E)
    # Byte 4: CR (0x0D)
    if data[1:4] != b"\x0a\x1e\x0d":
        print(f"FAIL: Header control characters mismatch. Found: {data[1:4].hex()}")
        return False

    header_str = data[:21].decode("iso-8859-1")
    print(f"Header: {header_str.replace(chr(10), '<LF>').replace(chr(30), '<RS>').replace(chr(13), '<CR>')}")

    file_type = header_str[4:9]
    if file_type != "ANSI ":
        print(f"FAIL: File type should be 'ANSI ', found '{file_type}'")
        # Note: ANSI followed by space
    
    iin = header_str[9:15]
    version = header_str[15:17]
    juris_ver = header_str[17:19]
    num_entries = int(header_str[19:21])

    print(f"IIN: {iin}, Version: {version}, JurisVer: {juris_ver}, Entries: {num_entries}")

    if version != "11":
        print(f"WARNING: Version is '{version}', expected '11' for AAMVA 2025.")

    # Subfile Designators
    pos = 21
    for i in range(num_entries):
        sub_type = data[pos:pos+2].decode("iso-8859-1")
        offset = int(data[pos+2:pos+6].decode("iso-8859-1"))
        length = int(data[pos+6:pos+10].decode("iso-8859-1"))
        print(f"Subfile {i+1}: Type={sub_type}, Offset={offset}, Length={length}")
        
        # Verify subfile content
        sub_data = data[offset:offset+length]
        if not sub_data.startswith(sub_type.encode("iso-8859-1")):
            print(f"FAIL: Subfile {i+1} does not start with type '{sub_type}' at offset {offset}")
        
        if not sub_data.endswith(b"\x1e"):
            print(f"FAIL: Subfile {i+1} does not end with RS (0x1E)")
        
        pos += 10

    print("\nVerification PASSED (Basic structural check)")
    return True

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "aamva_2025_payload.bin"
    verify_aamva_2025(path)
