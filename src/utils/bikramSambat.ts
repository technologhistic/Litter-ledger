import { BsDate } from '../types';

export const BS_MONTH_NAMES_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export const BS_MONTH_NAMES_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत',
];

export const DAY_NAMES_EN = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const DAY_NAMES_NP = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार',
];

export const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// Days in each Bikram Sambat month (Baishakh to Chaitra) for BS Years 2070 to 2090
const MONTH_DAYS: Record<number, number[]> = {
  2070: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2078: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2085: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2086: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2087: [31, 31, 32, 31, 31, 30, 30, 30, 29, 29, 30, 30],
  2088: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 31],
  2090: [30, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
};

// Start of 1 Baishakh in Gregorian AD (Year, Month 1-based, Day)
const BS_YEAR_START_AD: Record<number, [number, number, number]> = {
  2070: [2013, 4, 14],
  2071: [2014, 4, 14],
  2072: [2015, 4, 14],
  2073: [2016, 4, 13],
  2074: [2017, 4, 14],
  2075: [2018, 4, 14],
  2076: [2019, 4, 14],
  2077: [2020, 4, 13],
  2078: [2021, 4, 14],
  2079: [2022, 4, 14],
  2080: [2023, 4, 14],
  2081: [2024, 4, 13],
  2082: [2025, 4, 14],
  2083: [2026, 4, 14],
  2084: [2027, 4, 14],
  2085: [2028, 4, 13],
  2086: [2029, 4, 14],
  2087: [2030, 4, 14],
  2088: [2031, 4, 14],
  2089: [2032, 4, 13],
  2090: [2033, 4, 14],
};

const DEFAULT_MONTH_DAYS = [31, 31, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30];

export function toNepaliDigits(input: number | string): string {
  const str = String(input);
  return str
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 48 && code <= 57) {
        return NEPALI_DIGITS[code - 48];
      }
      return ch;
    })
    .join('');
}

/**
 * Converts a Gregorian date (YYYY-MM-DD or Date object) to Bikram Sambat BsDate
 */
export function adToBs(dateInput: Date | string): BsDate {
  let adYear: number;
  let adMonth: number;
  let adDay: number;
  let dayOfWeekIdx: number;

  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-');
    adYear = parseInt(parts[0], 10);
    adMonth = parseInt(parts[1], 10);
    adDay = parseInt(parts[2], 10);
    const d = new Date(Date.UTC(adYear, adMonth - 1, adDay));
    dayOfWeekIdx = d.getUTCDay();
  } else {
    adYear = dateInput.getFullYear();
    adMonth = dateInput.getMonth() + 1;
    adDay = dateInput.getDate();
    dayOfWeekIdx = dateInput.getDay();
  }

  const dayOfWeekEn = DAY_NAMES_EN[dayOfWeekIdx] || 'Sunday';
  const dayOfWeekNp = DAY_NAMES_NP[dayOfWeekIdx] || 'आइतबार';

  let bsYear = adYear + 57;
  const currentYearStart = BS_YEAR_START_AD[bsYear] || [adYear, 4, 14];

  // If before 1 Baishakh of this BS year, it belongs to the previous BS year
  if (
    adMonth < currentYearStart[1] ||
    (adMonth === currentYearStart[1] && adDay < currentYearStart[2])
  ) {
    bsYear = adYear + 56;
  }

  const start = BS_YEAR_START_AD[bsYear] || [bsYear - 57, 4, 14];
  const startMs = Date.UTC(start[0], start[1] - 1, start[2]);
  const targetMs = Date.UTC(adYear, adMonth - 1, adDay);

  let daysElapsed = Math.floor((targetMs - startMs) / 86400000);
  const months = MONTH_DAYS[bsYear] || DEFAULT_MONTH_DAYS;

  let bsMonth = 1;
  for (let m = 0; m < months.length; m++) {
    const daysInM = months[m];
    if (daysElapsed >= daysInM) {
      daysElapsed -= daysInM;
      bsMonth++;
    } else {
      break;
    }
  }

  const bsDay = daysElapsed + 1;
  const monthNameEn = BS_MONTH_NAMES_EN[bsMonth - 1] || '';
  const monthNameNp = BS_MONTH_NAMES_NP[bsMonth - 1] || '';
  const pad = (n: number) => String(n).padStart(2, '0');

  return {
    year: bsYear,
    month: bsMonth,
    day: bsDay,
    dayOfWeek: dayOfWeekEn,
    dayOfWeekNp: dayOfWeekNp,
    monthNameEn,
    monthNameNp,
    formattedBsDate: `${bsDay} ${monthNameEn} ${bsYear} BS`,
    formattedFull: `${dayOfWeekEn}, ${bsDay} ${monthNameEn} ${bsYear} BS`,
    formattedBilingual: `${dayOfWeekEn}, ${bsDay} ${monthNameEn} ${bsYear} BS (${monthNameNp} ${toNepaliDigits(bsDay)})`,
    yearMonthKey: `${bsYear}-${pad(bsMonth)}`,
    isoBsDate: `${bsYear}-${pad(bsMonth)}-${pad(bsDay)}`,
    nepaliNumeralDate: `${toNepaliDigits(bsDay)} ${monthNameNp} ${toNepaliDigits(bsYear)}`,
  };
}

export function getTodayIsoDate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getTodayBs(): BsDate {
  return adToBs(new Date());
}

export function shiftBsMonth(currentBsYearMonth: string, deltaMonths: number): string {
  const parts = currentBsYearMonth.split('-');
  let y = parseInt(parts[0], 10) || getTodayBs().year;
  let m = parseInt(parts[1], 10) || getTodayBs().month;

  m += deltaMonths;
  while (m > 12) {
    m -= 12;
    y++;
  }
  while (m < 1) {
    m += 12;
    y--;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}`;
}

export function shiftAdMonth(currentAdYearMonth: string, deltaMonths: number): string {
  const parts = currentAdYearMonth.split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);

  m += deltaMonths;
  while (m > 12) {
    m -= 12;
    y++;
  }
  while (m < 1) {
    m += 12;
    y--;
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}`;
}

export function formatBsMonthDisplay(bsYearMonth: string): string {
  const parts = bsYearMonth.split('-');
  const y = parseInt(parts[0], 10) || getTodayBs().year;
  const m = parseInt(parts[1], 10) || getTodayBs().month;
  const monthEn = BS_MONTH_NAMES_EN[m - 1] || '';
  const monthNp = BS_MONTH_NAMES_NP[m - 1] || '';
  return `${monthEn} ${y} BS (${monthNp} ${toNepaliDigits(y)})`;
}

export function formatAdMonthDisplay(adYearMonth: string): string {
  const parts = adYearMonth.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
