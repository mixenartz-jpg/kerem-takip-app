import {
  LayoutDashboard, CalendarCheck, Sparkles, Users2,
  CheckSquare, StickyNote, FolderKanban, Repeat2, Timer,
  Target, Zap, BarChart2,
  Video, GraduationCap, BookMarked, ListChecks,
} from 'lucide-react';

export const WORKSPACES = {
  akademi: {
    id: 'akademi',
    label: 'Akademi',
    shortLabel: 'Akademi',
    icon: GraduationCap,
    accent: '#34d399',
    accentSoft: 'rgba(52,211,153,0.15)',
    description: 'Çalışma, sınavlar, AI plan',
  },
  gunluk: {
    id: 'gunluk',
    label: 'Günlük',
    shortLabel: 'Günlük',
    icon: Zap,
    accent: '#8b5cf6',
    accentSoft: 'rgba(139,92,246,0.15)',
    description: 'Görevler, alışkanlıklar, projeler',
  },
};

export const WORKSPACE_LIST = [WORKSPACES.akademi, WORKSPACES.gunluk];

export function getDefaultWorkspace(userMode) {
  if (userMode === 'yks') return 'akademi';
  if (userMode === 'daily') return 'gunluk';
  return 'gunluk';
}

export const NAV_GROUPS_AKADEMI = [
  {
    label: 'Akademi',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/gunluk-plan', icon: ListChecks, label: 'Günlük Plan' },
      { to: '/planner', icon: Sparkles, label: 'AI Planlayıcı', ai: true },
      { to: '/yks', icon: Zap, label: 'YKS Merkezi' },
      { to: '/kaynaklar', icon: BookMarked, label: 'Çalışma Kaynakları' },
    ],
  },
];

export const NAV_GROUPS_GUNLUK = [
  {
    label: 'Günlük',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/tasks', icon: CheckSquare, label: 'Görevler' },
      { to: '/calendar', icon: CalendarCheck, label: 'Takvim' },
      { to: '/projects', icon: FolderKanban, label: 'Projeler' },
      { to: '/habits', icon: Repeat2, label: 'Alışkanlıklar' },
      { to: '/goals', icon: Target, label: 'Hedefler' },
    ],
  },
];

export const NAV_GROUPS_ORTAK = [
  {
    label: 'Ortak Araçlar',
    items: [
      { to: '/notes', icon: StickyNote, label: 'Notlar' },
      { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
      { to: '/ai', icon: Sparkles, label: 'AI Merkezi', ai: true, premium: 'ai' },
      { to: '/video-summarizer', icon: Video, label: 'Video Özetleyici', ai: true },
      { to: '/stats', icon: BarChart2, label: 'İstatistikler', premium: 'istatistikler' },
      { to: '/sosyal', icon: Users2, label: 'Sosyal' },
    ],
  },
];

export function getWorkspaceGroups(workspace) {
  return workspace === 'akademi' ? NAV_GROUPS_AKADEMI : NAV_GROUPS_GUNLUK;
}

export function getBottomNavItems(workspace) {
  if (workspace === 'akademi') {
    return [
      { to: '/', icon: LayoutDashboard, label: 'Ana', end: true },
      { to: '/yks', icon: Zap, label: 'YKS' },
      { to: '/planner', icon: Sparkles, label: 'AI Plan', ai: true },
      { to: '/notes', icon: StickyNote, label: 'Notlar' },
      { to: '/sosyal', icon: Users2, label: 'Sosyal' },
    ];
  }
  return [
    { to: '/', icon: LayoutDashboard, label: 'Ana', end: true },
    { to: '/tasks', icon: CheckSquare, label: 'Görevler' },
    { to: '/calendar', icon: CalendarCheck, label: 'Takvim' },
    { to: '/notes', icon: StickyNote, label: 'Notlar' },
    { to: '/sosyal', icon: Users2, label: 'Sosyal' },
  ];
}
