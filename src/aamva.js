/**
 * AAMVA 2025 Payload Generator
 * Based on AAMVA DL/ID Card Design Standard 2025
 */

export function generateAamvaPayload(data) {
  // Control Characters
  const LF = "\n";
  const RS = "\x1e";
  const CR = "\r";

  // Header Data
  const iin = (data.iin || "636000").padStart(6, "0");
  const aamvaVer = (data.aamvaVer || "11").padStart(2, "0");
  const jurisVer = (data.jurisVer || "00").padStart(2, "0");
  const numEntries = "01"; // Defaulting to 1 subfile (DL)

  // Header string (21 bytes)
  // @ + LF + RS + CR + ANSI + IIN + AAMVA_VER + JURIS_VER + NUM_ENTRIES
  const header = `@${LF}${RS}${CR}ANSI ${iin}${aamvaVer}${jurisVer}${numEntries}`;

  // Subfile 'DL'
  const subfileType = "DL";

  // Build DL data elements
  // Mandatory and common fields
  const mapping = {
    DAQ: data.customer_id || "",
    DCS: (data.family_name || "").toUpperCase(),
    DAC: (data.first_name || "").toUpperCase(),
    DAD: (data.middle_name || "").toUpperCase(),
    DBD: formatDate(data.issue_date || ""),
    DBB: formatDate(data.dob || ""),
    DBA: formatDate(data.expiry_date || ""),
    DBC: data.sex || "",
    DAY: (data.eye_color || "").toUpperCase(),
    DAU: data.height || "",
    DAG: (data.street || "").toUpperCase(),
    DAI: (data.city || "").toUpperCase(),
    DAJ: (data.state || "").toUpperCase(),
    DAK: data.zip || "",
    DCF: data.doc_discriminator || "",
    DCG: data.country || "USA",
    DDE: data.family_name_truncation || "N",
    DDF: data.first_name_truncation || "N",
    DDG: data.middle_name_truncation || "N",
    DAZ: (data.hair_color || "").toUpperCase(),
    DAW: data.weight || "",
    DCL: data.ethnicity || "",
    DCA: data.vehicle_class || "NONE",
    DCB: data.restriction_code || "NONE",
    DCD: data.endorsement_code || "NONE",
    DCU: data.suffix || "NONE",
    DDB: formatDate(data.card_revision_date || ""),
    DDD: data.limited_duration || "N",
    DCK: data.inventory_control_number || "",
  };

  let dlData = "DL";
  for (const [code, val] of Object.entries(mapping)) {
    if (val !== undefined && val !== null && val !== "") {
      dlData += `${code}${val}${LF}`;
    }
  }

  // Record Separator ends the subfile
  dlData += RS;

  // Calculate Offset and Length
  // Header is 21 bytes
  // One subfile designator is 10 bytes
  // Total header + directory = 31 bytes
  const offset = 31;
  const length = dlData.length;

  const subfileDesignator = `${subfileType}${offset.toString().padStart(4, "0")}${length.toString().padStart(4, "0")}`;

  const payload = header + subfileDesignator + dlData;
  return payload;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  // Remove slashes or dashes
  return dateStr.replace(/[\/-]/g, "");
}
