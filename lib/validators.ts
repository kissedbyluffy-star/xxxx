import { z } from 'zod';
import { ASSETS, NETWORKS, FIAT_CURRENCIES, PAYOUT_METHODS } from './constants';

export const createOrderSchema = z.object({
  asset_symbol: z.enum(ASSETS),
  network: z.enum(NETWORKS),
  amount_crypto: z.number().positive(),
  fiat_currency: z.enum(FIAT_CURRENCIES),
  payout_method: z.enum(PAYOUT_METHODS)
});

export const payoutSchema = z.object({
  payout_method: z.enum(PAYOUT_METHODS),
  country: z.string().min(2),
  details: z.record(z.string().optional()).optional()
});

export const txidSchema = z.object({
  txid: z.string().min(6)
});

export const adminOrderUpdateSchema = z.object({
  status: z.string().optional(),
  confirmations_current: z.number().int().min(0).optional(),
  payout_reference: z.string().optional().nullable(),
  admin_note: z.string().optional().nullable()
});

export const rateSchema = z.object({
  asset_symbol: z.enum(ASSETS),
  network: z.enum(NETWORKS),
  fiat_currency: z.enum(FIAT_CURRENCIES),
  buy_rate: z.number().positive(),
  fee_pct: z.number().min(0).optional().nullable(),
  fee_flat: z.number().min(0).optional().nullable()
});

export const settingsSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export const addressSchema = z.object({
  network: z.enum(NETWORKS),
  address: z.string().min(8)
});
