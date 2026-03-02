import bwipjs from 'bwip-js';

const codes = {
  "DAQ": "ID Number",
  "DCF": "Document Discriminator",
  "DBD": "Issue Date (MMDDYYYY)",
  "DBB": "Date of Birth (MMDDYYYY)",
  "DBA": "Expiration Date (MMDDYYYY)",
  "DAC": "First Name",
  "DAD": "Middle Names",
  "DCS": "Surname",
  "DAU": "Height (e.g. 069 IN)",
  "DBC": "Gender (1=M, 2=F)",
  "DAY": "Eye Color (e.g. BLK)",
  "DAG": "Street Address",
  "DAI": "City",
  "DAJ": "State Code",
  "DAK": "ZIP Code",
  "DCG": "Country",
  "DDA": "Compliance Type",
  "DCJ": "Audit Information",
  "DCL": "Ethnicity",
  "DCA": "Vehicle Class",
  "DCB": "Restriction Code",
  "DCD": "Endorsement Code",
  "DCU": "Suffix",
  "DDB": "Card Revision Date",
  "DDD": "Limited Duration",
  "DCK": "Inventory Control Number"
};

const defaultRaw = `@
ANSI 636020100001DL00310242DLDAQ123456789
DCF1234567
DBD01012022
DBB01011970
DBA01012027
DACFIRSTNAME
DDFN
DADMIDDLENAME
DDGN
DCSLASTNAME
DDEN
DAU069 IN
DBC1
DAYBLK
DAG123 MAIN STREET
DAIDENVER
DAJCO
DAK800120000 
DCGUSA
DDAF
DCJCODL_0_082418_04105
DCLU
DCANONE
DCBNONE
DCDNONE
DCUNONE
DDB01012022
DDDN
DCK000000000`;

const formFieldsContainer = document.getElementById('form-fields');
const rawAamvaTextarea = document.getElementById('raw-aamva');
const barcodeCanvas = document.getElementById('barcode-canvas');
const downloadBtn = document.getElementById('download-btn');

let rawLines = [];
let parsedData = {};

function init() {
  rawAamvaTextarea.value = defaultRaw.trim();
  generateFormFields();
  
  handleRawChange();

  rawAamvaTextarea.addEventListener('input', handleRawChange);
  downloadBtn.addEventListener('click', downloadBarcode);
}

function generateFormFields() {
  formFieldsContainer.innerHTML = '';
  Object.keys(codes).forEach(key => {
    const labelText = codes[key];
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col';
    
    const label = document.createElement('label');
    label.className = 'text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2';
    label.innerHTML = `<span class="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-bold">${key}</span> ${labelText}`;
    label.htmlFor = `input-${key}`;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `input-${key}`;
    input.className = 'px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow text-slate-800 shadow-sm';
    input.addEventListener('input', () => handleFieldChange(key, input.value));
    
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    formFieldsContainer.appendChild(wrapper);
  });
}

function parseRaw(rawStr) {
  parsedData = {};
  rawLines = rawStr.split('\n');
  rawLines.forEach(line => {
    // For line 1 which has format ANSI...DLDAQ...
    if (line.includes('DAQ')) {
      const idx = line.indexOf('DAQ');
      parsedData['DAQ'] = line.substring(idx + 3).trim();
    }
    
    Object.keys(codes).forEach(key => {
      if (key === 'DAQ') return;
      if (line.startsWith(key)) {
        parsedData[key] = line.substring(key.length).trim();
      } else {
        const match = line.split(key);
        if (match && match.length > 1 && !parsedData[key]) {
          parsedData[key] = match[1].trim();
        }
      }
    });
  });
}

function updateFormFromParsed() {
  Object.keys(codes).forEach(key => {
    const input = document.getElementById(`input-${key}`);
    if (input) {
      input.value = parsedData[key] || '';
    }
  });
}

function handleRawChange() {
  const rawStr = rawAamvaTextarea.value.toUpperCase();
  rawAamvaTextarea.value = rawStr;
  parseRaw(rawStr);
  updateFormFromParsed();
  renderBarcode(rawStr);
}

function handleFieldChange(key, newValue) {
  newValue = newValue.toUpperCase();
  parsedData[key] = newValue;
  
  const input = document.getElementById(`input-${key}`);
  if (input) input.value = newValue; 
  
  updateRawFromForm();
}

function updateRawFromForm() {
  if (rawLines.length < 2) return;
  
  const daqInput = document.getElementById('input-DAQ');
  if (daqInput && rawLines[1]) {
    rawLines[1] = rawLines[1].replace(/DAQ.*/, 'DAQ' + daqInput.value);
  }

  let newRaw = rawLines[0] + '\n' + rawLines[1] + '\n';
  
  Object.keys(codes).forEach(key => {
    if (key === 'DAQ') return;
    const input = document.getElementById(`input-${key}`);
    if (input && input.value) {
      newRaw += key + input.value + '\n';
    }
  });
  
  // Append missing original lines/flags that are not in the form
  const hiddenFlags = ['DDF', 'DDG', 'DDE'];
  hiddenFlags.forEach(flag => {
    if (parsedData[flag]) {
      newRaw += flag + parsedData[flag] + '\n';
    } else {
      newRaw += flag + 'N\n';
    }
  });

  const finalRaw = newRaw.trim();
  rawAamvaTextarea.value = finalRaw;
  renderBarcode(finalRaw);
}

function renderBarcode(text) {
  try {
    bwipjs.toCanvas(barcodeCanvas, {
      bcid: 'pdf417',       // Barcode type
      text: text,           // Text to encode
      scale: 3,             // 3x scaling factor
      columns: 10,          // Standard density for AAMVA
      eclevel: 4,           // Error correction level 4
      includetext: false,
    });
  } catch (e) {
    console.error('Barcode rendering failed', e);
  }
}

function downloadBarcode() {
  const dataURL = barcodeCanvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.href = dataURL;
  const name = parsedData['DCS'] || 'Barcode';
  link.download = `AAMVA-PDF417-${name}.png`;
  link.click();
}

document.addEventListener('DOMContentLoaded', init);