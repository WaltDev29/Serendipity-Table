/**
 * Format phone number with hyphens automatically
 * 01012345678 -> 010-1234-5678
 * 0101234567 -> 010-123-4567
 * 0212345678 -> 02-1234-5678
 */
export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const clean = value.replace(/[^0-9]/g, '');
  if (clean.length < 4) {
    return clean;
  }
  if (clean.length < 7) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  if (clean.length <= 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
};
