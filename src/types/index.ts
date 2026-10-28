export type ShiftType = 'morning' | 'noon' | 'evening';

export interface Item {
  id: string;
  name: string;
  price: number; // Price per litre
  createdAt: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  date: string; // ISO format "YYYY-MM-DD" (Gregorian reference)
  item: string;
  litres: number;
  price: number; // Price per litre applied to this sale
  total: number; // litres * price rounded to 2 decimals
  shift: ShiftType;
  notes?: string;
}

export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'np';

export interface Settings {
  calendarSystem: 'BS' | 'AD';
  currency: string;
  businessName: string;
  phone: string;
  address: string;
  theme: ThemeMode;
  language: Language;
}

export interface BsDate {
  year: number;
  month: number; // 1 = Baishakh ... 12 = Chaitra
  day: number;
  dayOfWeek: string; // e.g. "Tuesday"
  dayOfWeekNp: string; // e.g. "मंगलबार"
  monthNameEn: string;
  monthNameNp: string;
  formattedBsDate: string; // "10 Kartik 2083 BS"
  formattedFull: string; // "Tuesday, 10 Kartik 2083 BS"
  formattedBilingual: string; // "Tuesday, 10 Kartik 2083 BS (कात्तिक १०)"
  yearMonthKey: string; // "2083-07"
  isoBsDate: string; // "2083-07-10"
  nepaliNumeralDate: string; // "१० कात्तिक २०८३"
}

export interface ShiftInfo {
  id: ShiftType;
  titleEn: string;
  titleNp: string;
  icon: string;
  timeRange: string;
}

export interface ShiftSummary {
  shift: ShiftType;
  litres: number;
  amount: number;
  count: number;
}

export interface DayHistoryGroup {
  date: string;
  dayOfWeek: string;
  dayOfWeekNp: string;
  formattedDateAndDay: string;
  totalLitres: number;
  totalAmount: number;
  salesCount: number;
  morningLitres: number;
  noonLitres: number;
  eveningLitres: number;
  sales: Sale[];
}
