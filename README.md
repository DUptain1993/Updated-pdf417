# AAMVA to PDF417 Generator

A modern, fast, client-side web application for generating AAMVA-compliant PDF417 barcodes. Updated to comply with the **2020 AAMVA DL/ID Card Design Standard** (Version 10).

## Features

- **2020 AAMVA Standard:** Fully supports mandatory data fields from the 2020 design standard, including Endorsement Codes, Revision Dates, and Inventory Control Numbers.
- **Live Preview:** Barcode updates automatically as you change form fields or edit the raw data string.
- **Two-way Sync:** Edit the raw AAMVA text, and the form fields will auto-populate. Edit the form, and the raw text will regenerate.
- **High-Quality Barcodes:** Powered by `bwip-js` for completely standard-compliant, scannable PDF417 image generation.
- **Modern UI:** Built with Tailwind CSS and Vite.

## Getting Started

### Prerequisites

- Node.js (v16+)

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Development Server

To run the app locally with hot-reloading:

```bash
npm run dev
```

### Build for Production

To create a minified build ready for deployment:

```bash
npm run build
```

## Structure
- `src/main.js`: Core Vanilla JS application logic, state management, and `bwip-js` initialization.
- `index.html`: The user interface, styled utilizing Tailwind CSS.
- `tailwind.config.js`: Tailwind configuration.