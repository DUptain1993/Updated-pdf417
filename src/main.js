import bwipjs from 'bwip-js';
import { generateAamvaPayload } from './aamva.js';

const fields = [
  { id: 'iin', label: 'Issuer Identification Number (IIN)', default: '636000' },
  { id: 'juris_ver', label: 'Jurisdiction Version Number', default: '00' },
  { id: 'customer_id', label: 'Customer ID (DAQ)', required: true },
  { id: 'family_name', label: 'Family Name (DCS)', required: true },
  { id: 'first_name', label: 'First Name (DAC)', required: true },
  { id: 'middle_name', label: 'Middle Name (DAD)' },
  { id: 'suffix', label: 'Suffix (DCU)', default: 'NONE' },
  { id: 'dob', label: 'Date of Birth (MMDDYYYY) (DBB)', required: true },
  { id: 'issue_date', label: 'Issue Date (MMDDYYYY) (DBD)', required: true },
  { id: 'expiry_date', label: 'Expiry Date (MMDDYYYY) (DBA)', required: true },
  { id: 'sex', label: 'Sex (1=M, 2=F, 9=U) (DBC)' },
  { id: 'eye_color', label: 'Eye Color (3 letters) (DAY)' },
  { id: 'hair_color', label: 'Hair Color (3 letters) (DAZ)' },
  { id: 'height', label: 'Height (e.g., 070 in) (DAU)' },
  { id: 'weight', label: 'Weight (DAW)' },
  { id: 'street', label: 'Street Address (123 MAIN ST) (DAG)' },
  { id: 'city', label: 'City (DAI)' },
  { id: 'state', label: 'State Code (2 letters) (DAJ)' },
  { id: 'zip', label: 'ZIP Code (DAK)' },
  { id: 'country', label: 'Country (USA/CAN) (DCG)', default: 'USA' },
  { id: 'doc_discriminator', label: 'Doc Discriminator (DCF)' },
  { id: 'card_revision_date', label: 'Card Revision Date (DDB)' },
  { id: 'inventory_control_number', label: 'Inventory Control Num (DCK)' },
  { id: 'vehicle_class', label: 'Vehicle Class (DCA)', default: 'NONE' },
  { id: 'restriction_code', label: 'Restriction Code (DCB)', default: 'NONE' },
  { id: 'endorsement_code', label: 'Endorsement Code (DCD)', default: 'NONE' },
  { id: 'family_name_truncation', label: 'Family Name Truncated? (T/N/U) (DDE)', default: 'N' },
  { id: 'first_name_truncation', label: 'First Name Truncated? (T/N/U) (DDF)', default: 'N' },
  { id: 'middle_name_truncation', label: 'Middle Name Truncated? (T/N/U) (DDG)', default: 'N' },
  { id: 'limited_duration', label: 'Limited Duration? (T/N) (DDD)', default: 'N' },
];

const formContainer = document.getElementById('form-fields');
const genBtn = document.getElementById('gen-btn');
const rawAamvaTextarea = document.getElementById('raw-aamva');
const barcodeCanvas = document.getElementById('barcode-canvas');
const downloadBtn = document.getElementById('download-btn');

function init() {
  generateInputs();
  genBtn.addEventListener('click', handleGenerate);
  downloadBtn.addEventListener('click', downloadBarcode);
}

function generateInputs() {
  formContainer.innerHTML = '';
  fields.forEach(field => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col';

    const label = document.createElement('label');
    label.className = 'text-sm font-medium text-slate-700 mb-1.5';
    label.textContent = field.label;
    label.htmlFor = `input-${field.id}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `input-${field.id}`;
    input.value = field.default || '';
    input.className = 'px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white';
    
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    formContainer.appendChild(wrapper);
  });
}

function handleGenerate(e) {
  if (e) e.preventDefault();
  
  const data = {};
  fields.forEach(field => {
    const input = document.getElementById(`input-${field.id}`);
    data[field.id] = input.value;
  });

  try {
    const payload = generateAamvaPayload(data);
    rawAamvaTextarea.value = payload;
    renderBarcode(payload);
  } catch (err) {
    console.error('Error generating payload:', err);
    alert('Error generating payload: ' + err.message);
  }
}

function renderBarcode(text) {
  try {
    // AAMVA PDF417 requirements:
    // - Columns: usually between 3 and 12
    // - EC Level: 3 to 5
    // - Aspect ratio: usually 3:1 to 5:1
    bwipjs.toCanvas(barcodeCanvas, {
      bcid: 'pdf417',
      text: text,
      scale: 2,
      columns: 10,
      eclevel: 3, // AAMVA minimum
      includetext: false,
    });
  } catch (e) {
    console.error('Barcode rendering failed', e);
    alert('Barcode rendering failed: ' + e.message);
  }
}

function downloadBarcode() {
  const dataURL = barcodeCanvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.href = dataURL;
  const lastName = (document.getElementById('input-family_name').value || 'Barcode').trim();
  link.download = `AAMVA-2025-${lastName}.png`;
  link.click();
}

document.addEventListener('DOMContentLoaded', init);
