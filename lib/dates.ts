/** Parsea YYYY-MM-DD en fecha local (evita que RESTE un día por UTC). */
export function parseLocalDate(isoDate: string) {
  const match = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
}

/** Ej: «21 de mayo de 2026» */
export function formatEpisodeDate(date: string) {
  const parsed = parseLocalDate(date);
  if (!parsed) return date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

/** Fecha de hoy en ISO (YYYY-MM-DD) en hora local. */
export function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Convierte ISO (YYYY-MM-DD) a formato visible DD-MM-YYYY. */
export function formatIsoToDisplayDate(isoDate: string) {
  const parsed = parseLocalDate(isoDate);
  if (!parsed) return isoDate;
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Parsea DD-MM-YYYY a ISO (YYYY-MM-DD). */
export function parseDisplayDateToIso(displayDate: string): string | null {
  const match = displayDate.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isValidDisplayDate(displayDate: string) {
  return parseDisplayDateToIso(displayDate) !== null;
}

/** Fecha de hoy en formato DD-MM-YYYY. */
export function todayDisplayDate() {
  return formatIsoToDisplayDate(todayIsoDate());
}
