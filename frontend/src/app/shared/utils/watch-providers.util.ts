export interface WatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  type: string;
}

export function getWatchProvidersList(watchProvidersObj: any): WatchProviderItem[] {
  if (!watchProvidersObj) return [];

  const userRegion = (navigator.language || 'en-US').split('-')[1]?.toUpperCase() || 'US';
  const providersForRegion = watchProvidersObj[userRegion] || watchProvidersObj['US'];

  if (!providersForRegion) return [];

  const flatrate = providersForRegion.flatrate || [];
  const rent = providersForRegion.rent || [];
  const buy = providersForRegion.buy || [];

  const seen = new Set<number>();
  const allProviders: WatchProviderItem[] = [];

  for (const p of flatrate) {
    if (!seen.has(p.provider_id)) {
      seen.add(p.provider_id);
      allProviders.push({ ...p, type: 'Stream' });
    }
  }

  for (const p of [...rent, ...buy]) {
    if (!seen.has(p.provider_id)) {
      seen.add(p.provider_id);
      allProviders.push({ ...p, type: 'Rent/Buy' });
    }
  }

  return allProviders;
}
