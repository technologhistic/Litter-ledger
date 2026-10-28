import { ShiftInfo, ShiftType } from '../types';

export const SHIFTS: Record<ShiftType, ShiftInfo> = {
  morning: {
    id: 'morning',
    titleEn: 'Morning',
    titleNp: 'बिहान',
    icon: '☀️',
    timeRange: '04:00 - 11:59',
  },
  noon: {
    id: 'noon',
    titleEn: 'Noon',
    titleNp: 'दिउँसो',
    icon: '⛅',
    timeRange: '12:00 - 16:59',
  },
  evening: {
    id: 'evening',
    titleEn: 'Evening',
    titleNp: 'साँझ',
    icon: '🌙',
    timeRange: '17:00 - 23:59',
  },
};

export const SHIFT_LIST: ShiftType[] = ['morning', 'noon', 'evening'];

export function getCurrentShift(): ShiftType {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'noon';
  } else {
    return 'evening';
  }
}

export function getShiftInfo(shift: ShiftType): ShiftInfo {
  return SHIFTS[shift] || SHIFTS.morning;
}

export function formatShiftLabel(shift: ShiftType): string {
  const info = getShiftInfo(shift);
  return `${info.icon} ${info.titleEn} (${info.titleNp})`;
}
