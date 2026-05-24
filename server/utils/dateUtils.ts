export function getLocalDateString(timezone?: string): string {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now);
  } catch {
    const d = timezone
      ? new Date(now.toLocaleString('en-US', { timeZone: timezone }))
      : now;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

export function getDateInTimezone(date: Date, timezone?: string): Date {
  try {
    const str = date.toLocaleString('en-US', { timeZone: timezone || 'UTC' });
    return new Date(str);
  } catch {
    return date;
  }
}

export function formatDateString(date: Date, timezone?: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
