export const ASSETS = ['BTC', 'ETH', 'USDT'] as const;
export const NETWORKS = ['BTC', 'ERC20', 'BEP20', 'TRC20'] as const;
export const FIAT_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP'] as const;
export const PAYOUT_METHODS = ['Bank Transfer', 'UPI', 'Other'] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending_deposit: 'Awaiting deposit',
  detecting: 'Detecting transaction',
  confirming: 'Confirming on blockchain',
  payout_processing: 'Processing payout',
  completed: 'Completed',
  hold: 'On hold',
  rejected: 'Rejected'
};

export const TIMELINE_STEPS = [
  'pending_deposit',
  'detecting',
  'confirming',
  'payout_processing',
  'completed'
] as const;
