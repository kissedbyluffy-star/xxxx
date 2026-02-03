export function maskPayoutDetails(details: Record<string, any> | null) {
  if (!details) return null;
  const masked: Record<string, any> = {};
  Object.entries(details).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 4) {
      masked[key] = `${value.slice(0, 2)}•••${value.slice(-2)}`;
    } else {
      masked[key] = value;
    }
  });
  return masked;
}
