export function maskPayoutDetails(details: Record<string, unknown>) {
  const masked: Record<string, string> = {};
  Object.entries(details).forEach(([key, value]) => {
    const text = String(value ?? '');
    if (!text) {
      masked[key] = '';
      return;
    }
    if (text.length <= 4) {
      masked[key] = '****';
    } else {
      masked[key] = `${text.slice(0, 2)}****${text.slice(-2)}`;
    }
  });
  return masked;
}
