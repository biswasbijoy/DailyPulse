import api from './api';
import type { AnalyticsData } from '@/types';

export async function getWeeklyAnalytics(): Promise<AnalyticsData> {
  const res = await api.get('/analytics/weekly');
  return res.data.data;
}

export async function getMonthlyAnalytics(): Promise<AnalyticsData> {
  const res = await api.get('/analytics/monthly');
  return res.data.data;
}

export async function getQuarterlyAnalytics(): Promise<AnalyticsData> {
  const res = await api.get('/analytics/quarterly');
  return res.data.data;
}

export async function getHalfYearlyAnalytics(): Promise<AnalyticsData> {
  const res = await api.get('/analytics/half-yearly');
  return res.data.data;
}

export async function getYearlyAnalytics(): Promise<AnalyticsData> {
  const res = await api.get('/analytics/yearly');
  return res.data.data;
}
