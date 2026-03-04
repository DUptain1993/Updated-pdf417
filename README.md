# AAMVA 2025 PDF417 Generator

A client-side web application for generating AAMVA-compliant PDF417 barcodes, updated to the **2025 AAMVA DL/ID Card Design Standard** (Annex D).

## Features

- **2025 Standard Compliant:** Supports the latest header format, control characters (`LF`, `RS`, `CR`), and directory structure.
- **Offline Capable:** Runs entirely in your browser. Once dependencies are installed and the project is built, it can be served from any local web server.
- **Simple "GEN" Interface:** Fill in the required driver information and hit the **GEN** button to create the full AAMVA string and PDF417 barcode.
- **Payload Verification:** Built-in logic to handle mandatory fields and standard formatting (dates, uppercase conversion, etc.).
- **High-Quality Barcodes:** Uses `bwip-js` for precise PDF417 encoding with proper error correction levels.

## How to Run (Offline Localhost)

### 1. Installation
Ensure you have [Node.js](https://nodejs.org/) installed. Run the following in your terminal:
```bash
npm install
```

### 2. Run Development Server
To start the application locally:
```bash
npm run dev
```
Open your browser to the URL provided (usually `http://localhost:5173`).

### 3. Build for Production (Zero Dependency)
To create a version that can be opened without Node.js:
```bash
npm run build
```
This creates a `dist/` folder. You can serve this folder using any simple HTTP server, for example:
```bash
npx serve dist
# OR
cd dist && python3 -m http.server 8080
```
Then open `http://localhost:8080` in Chrome.

## Technical Details

- **Header Format:** `@\n\x1e\rANSI <IIN><VER><JURIS><ENTRIES>`
- **Standard:** 2025 Annex D (Version 11)
- **Subfile Type:** DL (Driver License)
- **Encoding:** ISO-8859-1 (Latin-1) compatible strings.

## Credits
Based on logic from the `aamva/` directory, ported from Python to modern JavaScript.
