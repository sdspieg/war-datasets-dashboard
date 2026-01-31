import type {
  OverviewStats,
  DailyEvent,
  EventByType,
  EventByRegion,
  MonthlyEventData,
  MissileAttack,
  DailyAerialThreat,
  WeaponTypeSummary,
  EquipmentDaily,
  PersonnelDaily,
  CasualtyData,
  RefugeeByCountry,
  RefugeeTotals,
  ViinaDaily,
  ViinaMonthly,
  ViinaBySource,
  ViinaByOblast,
  ViinaMonthlyBySource,
  BellingcatDaily,
  BellingcatMonthly,
  BellingcatIncident,
} from '../types';

const BASE_PATH = import.meta.env.BASE_URL || '/';

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${BASE_PATH}data/${path}`.replace(/\/+/g, '/').replace(':/', '://');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const loadOverviewStats = () => fetchJson<OverviewStats>('overview_stats.json');
export const loadDailyEvents = () => fetchJson<DailyEvent[]>('daily_events.json');
export const loadEventsByType = () => fetchJson<EventByType[]>('events_by_type.json');
export const loadEventsByRegion = () => fetchJson<EventByRegion[]>('events_by_region.json');
export const loadMonthlyEvents = () => fetchJson<MonthlyEventData[]>('monthly_events.json');
export const loadMissileAttacks = () => fetchJson<MissileAttack[]>('missile_attacks_full.json');
export const loadDailyAerialThreats = () => fetchJson<DailyAerialThreat[]>('daily_aerial_threats.json');
export const loadWeaponTypes = () => fetchJson<WeaponTypeSummary[]>('weapon_types_summary.json');
export const loadEquipmentDaily = () => fetchJson<EquipmentDaily[]>('equipment_daily.json');
export const loadPersonnelDaily = () => fetchJson<PersonnelDaily[]>('personnel_daily.json');
export const loadCasualties = () => fetchJson<CasualtyData[]>('casualties_ohchr.json');
export const loadRefugeesByCountry = () => fetchJson<RefugeeByCountry[]>('refugees_by_country.json');
export const loadRefugeeTotals = () => fetchJson<RefugeeTotals[]>('refugee_totals.json');

// VIINA loaders
export const loadViinaDaily = () => fetchJson<ViinaDaily[]>('viina_daily.json');
export const loadViinaMonthly = () => fetchJson<ViinaMonthly[]>('viina_monthly.json');
export const loadViinaBySource = () => fetchJson<ViinaBySource[]>('viina_by_source.json');
export const loadViinaByOblast = () => fetchJson<ViinaByOblast[]>('viina_by_oblast.json');
export const loadViinaMonthlyBySource = () => fetchJson<ViinaMonthlyBySource[]>('viina_monthly_by_source.json');

// Bellingcat loaders
export const loadBellingcatDaily = () => fetchJson<BellingcatDaily[]>('bellingcat_daily.json');
export const loadBellingcatMonthly = () => fetchJson<BellingcatMonthly[]>('bellingcat_monthly.json');
export const loadBellingcatIncidents = () => fetchJson<BellingcatIncident[]>('bellingcat_incidents.json');
