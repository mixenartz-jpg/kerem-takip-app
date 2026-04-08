import { format, subDays, eachDayOfInterval } from 'date-fns';

export const getLast7Days = () => {
  const today = new Date();
  return eachDayOfInterval({ start: subDays(today, 6), end: today })
    .map(d => format(d, 'yyyy-MM-dd'));
};

export const getLast30Days = () => {
  const today = new Date();
  return eachDayOfInterval({ start: subDays(today, 29), end: today })
    .map(d => format(d, 'yyyy-MM-dd'));
};

export const getLast365Days = () => {
  const today = new Date();
  return eachDayOfInterval({ start: subDays(today, 364), end: today })
    .map(d => format(d, 'yyyy-MM-dd'));
};

export const calcStreak = (completions) => {
  if (!completions || completions.length === 0) return 0;
  const sorted = [...new Set(completions)].sort().reverse();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 0;
  let check = sorted[0] === today ? new Date() : subDays(new Date(), 1);
  for (const d of sorted) {
    if (d === format(check, 'yyyy-MM-dd')) {
      streak++;
      check = subDays(check, 1);
    } else break;
  }
  return streak;
};

export const QUOTES = [
  "Başarı, her gün küçük çabalar birikimiyle gelir.",
  "Bugün yaptıkların, yarınki seni belirler.",
  "Disiplin, motivasyonun tükendiği yerde devreye girer.",
  "Küçük adımlar, büyük yolculuklar yapar.",
  "Mükemmel olmaya çalışma, tutarlı ol.",
  "Her gün biraz daha iyi olmaya çalış.",
  "Harekete geçmek, mükemmel planlamaktan üstündür.",
  "Zorluklar seni güçlendirir, kaçınma onlardan.",
  "Odaklan. Çalış. Başar.",
  "Bugünün görevlerini bugün tamamla.",
];
