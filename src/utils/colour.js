/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Convert hex to RGB565 format (16-bit color for ESP32)
 * Format: RRRRRGGGGGGBBBBB (5-6-5 bits)
 */
export function hexToRgb565(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const r5 = Math.floor(rgb.r * 31 / 255); // 5 bits
  const g6 = Math.floor(rgb.g * 63 / 255); // 6 bits
  const b5 = Math.floor(rgb.b * 31 / 255); // 5 bits
  
  return (r5 << 11) | (g6 << 5) | b5;
}

/**
 * Convert RGB565 back to hex
 */
export function rgb565ToHex(rgb565) {
  const r5 = (rgb565 >> 11) & 0x1F;
  const g6 = (rgb565 >> 5) & 0x3F;
  const b5 = rgb565 & 0x1F;
  
  const r = Math.floor(r5 * 255 / 31);
  const g = Math.floor(g6 * 255 / 63);
  const b = Math.floor(b5 * 255 / 31);
  
  return rgbToHex(r, g, b);
}

/**
 * Validate hex color format
 */
export function isValidHex(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}