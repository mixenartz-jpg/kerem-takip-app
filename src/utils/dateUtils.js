import { format, isToday, isThisWeek, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isSameMonth, parseISO, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

export const formatDate = (date, fmt = 'dd MMM yyyy') =>
  format(new Date(date), fmt, { locale: tr });

export const formatTime = (date) =>
  format(new Date(date), 'HH:mm');

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');

export const getMonthDays = (date) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const isTodayDate = (date) => isToday(new Date(date));
export const isSameDayDate = (a, b) => isSameDay(new Date(a), new Date(b));
export const isSameMonthDate = (a, b) => isSameMonth(new Date(a), new Date(b));

export const nextMonth = (date) => addMonths(date, 1);
export const prevMonth = (date) => subMonths(date, 1);

export const daysBetween = (a, b) => differenceInDays(new Date(a), new Date(b));

export const DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'acil': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'yüksek': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'normal': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'düşük': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
    default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30';
  }
};
