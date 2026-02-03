import { requireServerSupabase } from './supabase';

export type SettingsMap = Record<string, any>;

export async function getSettings(): Promise<SettingsMap> {
  const supabase = requireServerSupabase();
  const { data, error } = await supabase.from('settings').select('*');
  if (error) {
    throw error;
  }
  const map: SettingsMap = {};
  data.forEach((row) => {
    map[row.key] = row.value;
  });
  return map;
}

export async function getRate(asset: string, network: string, fiat: string) {
  const supabase = requireServerSupabase();
  const { data, error } = await supabase
    .from('rates')
    .select('*')
    .eq('asset_symbol', asset)
    .eq('network', network)
    .eq('fiat_currency', fiat)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}
