'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, FormEvent } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BarChart3,
  BellRing,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CalendarClock,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  CircleDollarSign,
  CreditCard,
  Download,
  Dumbbell,
  Ellipsis,
  Film,
  Gift,
  HandCoins,
  HeartPulse,
  Home,
  House,
  Info,
  ImagePlus,
  Laptop,
  ListFilter,
  Landmark,
  MessageCircle,
  Minus,
  Palette,
  Pencil,
  Phone,
  Plane,
  Plus,
  ReceiptText,
  Repeat2,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Tags,
  Trash2,
  TrendingUp,
  UserRound,
  Utensils,
  WalletCards,
  X,
} from 'lucide-react';

type TxType = 'expense' | 'income';
type Tab = 'home' | 'accounts' | 'stats' | 'records' | 'profile';
type ThemeId = 'sunny' | 'forest' | 'ink' | 'ocean' | 'sunset' | 'plum' | 'custom';
type SettingsPanel = 'profile' | 'theme' | 'budget' | 'categories' | 'settings' | 'account' | 'bill' | 'repayment' | 'about' | null;
type AccountType = 'payment' | 'bank' | 'cash' | 'credit';
type ReimbursementStatus = 'none' | 'pending' | 'reimbursed';

type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: number;
  accountId: string;
  reimbursementStatus: ReimbursementStatus;
  installmentPlanId?: string;
};

type Account = {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  trackBalance: boolean;
  creditLimit: number;
  statementDay: number;
  dueDay: number;
  last4: string;
};

type Transfer = {
  id: string;
  kind: 'transfer' | 'repayment';
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  note: string;
  createdAt: number;
};

type InstallmentPlan = {
  id: string;
  transactionId: string;
  accountId: string;
  title: string;
  totalAmount: number;
  feeTotal: number;
  periods: number;
  startDate: string;
};

type ScheduledBill = {
  id: string;
  title: string;
  amount: number;
  dueDay: number;
  accountId: string;
  category: string;
  enabled: boolean;
};

type CustomCategory = {
  id: string;
  type: TxType;
  name: string;
};

type LedgerData = {
  version: number;
  transactions: Transaction[];
  budget: number;
  owner: string;
  avatar: string;
  avatarImage: string;
  theme: ThemeId;
  customAccent: string;
  lastCategory: string;
  hiddenCategories: string[];
  customCategories: CustomCategory[];
  accounts: Account[];
  transfers: Transfer[];
  installmentPlans: InstallmentPlan[];
  scheduledBills: ScheduledBill[];
  lastAccountId: string;
};

type Category = { name: string; icon: LucideIcon; color: string; soft: string; customId?: string };

const expenseCategories: Category[] = [
  { name: '餐饮', icon: Utensils, color: '#a85d2c', soft: '#faecdd' },
  { name: '交通', icon: Car, color: '#3f718e', soft: '#e5f0f6' },
  { name: '购物', icon: ShoppingBag, color: '#a75a67', soft: '#f8e7eb' },
  { name: '娱乐', icon: Film, color: '#765b9c', soft: '#efe9f7' },
  { name: '居住', icon: House, color: '#817045', soft: '#f4efdc' },
  { name: '医疗', icon: HeartPulse, color: '#b14d52', soft: '#f9e5e5' },
  { name: '运动', icon: Dumbbell, color: '#3f7c70', soft: '#e2f2ee' },
  { name: '通讯', icon: Phone, color: '#536f9f', soft: '#e8edf7' },
  { name: '服饰', icon: Shirt, color: '#9c657e', soft: '#f5e9ef' },
  { name: '美容', icon: Sparkles, color: '#aa6d4d', soft: '#f7eae2' },
  { name: '旅行', icon: Plane, color: '#3f7894', soft: '#e5f1f5' },
  { name: '社交', icon: MessageCircle, color: '#6b7d4a', soft: '#edf2e4' },
  { name: '数码', icon: Laptop, color: '#59667a', soft: '#e9edf1' },
  { name: '学习', icon: BookOpen, color: '#8a6848', soft: '#f4ebdf' },
  { name: '人情', icon: Gift, color: '#a65d59', soft: '#f8e8e5' },
  { name: '其他', icon: Ellipsis, color: '#6f7874', soft: '#ecefed' },
];

const incomeCategories: Category[] = [
  { name: '工资', icon: WalletCards, color: '#38725c', soft: '#e3f1eb' },
  { name: '奖金', icon: Gift, color: '#a66c37', soft: '#f8eadb' },
  { name: '兼职', icon: BriefcaseBusiness, color: '#526f9c', soft: '#e8edf7' },
  { name: '理财', icon: TrendingUp, color: '#427a65', soft: '#e2f1ea' },
  { name: '红包', icon: HandCoins, color: '#a95454', soft: '#f8e6e6' },
  { name: '退款', icon: RotateCcw, color: '#777047', soft: '#f2efdf' },
  { name: '其他', icon: Ellipsis, color: '#6f7874', soft: '#ecefed' },
];

const allCategories = [...expenseCategories, ...incomeCategories];
const STORAGE_KEY = 'shizhang-accounts-v1';
const customCategoryPalettes = [
  { color: '#6b668f', soft: '#efedf7' },
  { color: '#49776c', soft: '#e7f1ee' },
  { color: '#9a624f', soft: '#f5e9e4' },
  { color: '#5e718c', soft: '#e9eef4' },
  { color: '#8a6d3f', soft: '#f3eddf' },
];

const themeOptions: Array<{ id: Exclude<ThemeId, 'custom'>; name: string; accent: string }> = [
  { id: 'sunny', name: '暖阳黄', accent: '#f3c84b' },
  { id: 'forest', name: '森林绿', accent: '#216a57' },
  { id: 'ink', name: '墨石黑', accent: '#343b3f' },
  { id: 'ocean', name: '海盐蓝', accent: '#416e91' },
  { id: 'sunset', name: '暮霞橙', accent: '#a95f3f' },
  { id: 'plum', name: '葡萄紫', accent: '#76537f' },
];

function mixHexWithWhite(hex: string, amount: number) {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#f8f0cf';
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  return `#${channels.map((channel) => Math.round(channel + (255 - channel) * amount).toString(16).padStart(2, '0')).join('')}`;
}

function darkenHex(hex: string, amount: number) {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#8a6d16';
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  return `#${channels.map((channel) => Math.round(channel * (1 - amount)).toString(16).padStart(2, '0')).join('')}`;
}

function contrastText(hex: string) {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#26251f';
  const [r, g, b] = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 155 ? '#26251f' : '#ffffff';
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function relativeDate(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return dateKey(date);
}

function buildEmpty(): LedgerData {
  return {
    version: 6,
    budget: 0,
    owner: '我的账本',
    avatar: '我',
    avatarImage: '',
    theme: 'sunny',
    customAccent: '#f3c84b',
    lastCategory: '餐饮',
    hiddenCategories: [],
    customCategories: [],
    accounts: [],
    transfers: [],
    installmentPlans: [],
    scheduledBills: [],
    lastAccountId: '',
    transactions: [],
  };
}

const formatMoney = (value: number, digits = 2) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const accountTypeLabels: Record<AccountType, string> = { payment: '支付账户', bank: '银行卡', cash: '现金', credit: '信用账户' };

function nextDueDate(day: number, from = new Date()) {
  const safeDay = Math.max(1, Math.min(28, day));
  let due = new Date(from.getFullYear(), from.getMonth(), safeDay, 12);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  if (due < today) due = new Date(from.getFullYear(), from.getMonth() + 1, safeDay, 12);
  return due;
}

function daysBetween(from: Date, to: Date) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12).getTime();
  return Math.round((to.getTime() - start) / 86400000);
}

function customCategoryMeta(category: CustomCategory): Category {
  const seed = [...category.name].reduce((sum, character) => sum + (character.codePointAt(0) ?? 0), category.type === 'income' ? 2 : 0);
  const palette = customCategoryPalettes[seed % customCategoryPalettes.length];
  return { name: category.name, icon: Tags, color: palette.color, soft: palette.soft, customId: category.id };
}

function categoryMeta(name: string, type: TxType, customCategories: CustomCategory[] = []) {
  return (type === 'income' ? incomeCategories : expenseCategories).find((item) => item.name === name)
    ?? customCategories.filter((item) => item.type === type).map(customCategoryMeta).find((item) => item.name === name)
    ?? allCategories.find((item) => item.name === name)
    ?? { name, icon: Tags, color: '#6f7874', soft: '#ecefed' };
}

function friendlyDate(value: string) {
  if (value === relativeDate(0)) return '今天';
  if (value === relativeDate(1)) return '昨天';
  const [, month, day] = value.split('-');
  return `${Number(month)}月${Number(day)}日`;
}

function MonthControl({ value, onChange }: { value: Date; onChange: (date: Date) => void }) {
  const current = new Date();
  const isCurrent = monthKey(value) === monthKey(current);
  return (
    <div className="month-control" aria-label="选择月份">
      <button aria-label="上个月" onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
      <span>{value.getFullYear() === current.getFullYear() ? '' : `${value.getFullYear()}年`}{value.getMonth() + 1}月</span>
      <button aria-label="下个月" disabled={isCurrent} onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
    </div>
  );
}

export default function HomePage() {
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const recordsOriginScroll = useRef(0);
  const [data, setData] = useState<LedgerData>(() => buildEmpty());
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [trendWindow, setTrendWindow] = useState(0);
  const [entryOpen, setEntryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftType, setDraftType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [baseAmount, setBaseAmount] = useState<number | null>(null);
  const [operator, setOperator] = useState<'+' | '-' | null>(null);
  const [category, setCategory] = useState('餐饮');
  const [note, setNote] = useState('');
  const [txDate, setTxDate] = useState(relativeDate(0));
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [reimbursementStatus, setReimbursementStatus] = useState<ReimbursementStatus>('none');
  const [installmentEnabled, setInstallmentEnabled] = useState(false);
  const [installmentPeriods, setInstallmentPeriods] = useState(3);
  const [installmentFee, setInstallmentFee] = useState('');
  const [recordFilter, setRecordFilter] = useState<'all' | TxType>('all');
  const [recordDateFilter, setRecordDateFilter] = useState<'all' | string>('all');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState<{ name: string; type: TxType } | null>(null);
  const [recordAccountFilter, setRecordAccountFilter] = useState('all');
  const [recordsOrigin, setRecordsOrigin] = useState<Exclude<Tab, 'records'> | null>(null);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>(null);
  const [newCategoryNames, setNewCategoryNames] = useState<Record<TxType, string>>({ expense: '', income: '' });
  const [accountDraft, setAccountDraft] = useState({ name: '', type: 'payment' as AccountType, openingBalance: '', trackBalance: false, creditLimit: '', statementDay: '5', dueDay: '25', last4: '' });
  const [billDraft, setBillDraft] = useState({ title: '', amount: '', dueDay: '1', accountId: '', category: '居住' });
  const [repaymentAccountId, setRepaymentAccountId] = useState('');
  const [repaymentFromId, setRepaymentFromId] = useState('external');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentDate, setRepaymentDate] = useState(relativeDate(0));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<LedgerData>;
        const fallback = buildEmpty();
        const realTransactions = (parsed.transactions ?? []).filter((tx) => !tx.id.startsWith('seed-'));
        // Device-local data is intentionally restored only after the client mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({
          ...fallback,
          ...parsed,
          version: 6,
          transactions: realTransactions.map((tx) => ({ ...tx, accountId: tx.accountId || '', reimbursementStatus: tx.reimbursementStatus || 'none' })),
          owner: parsed.owner?.trim() || fallback.owner,
          avatar: parsed.avatar?.trim() || parsed.owner?.trim().slice(0, 1) || fallback.avatar,
          avatarImage: parsed.avatarImage || '',
          theme: parsed.theme || fallback.theme,
          customAccent: parsed.customAccent || fallback.customAccent,
          lastCategory: parsed.lastCategory || fallback.lastCategory,
          hiddenCategories: parsed.hiddenCategories ?? [],
          customCategories: parsed.customCategories?.filter((item) => item && (item.type === 'expense' || item.type === 'income') && item.name?.trim()).map((item) => ({ ...item, name: item.name.trim() })) ?? [],
          accounts: parsed.accounts ?? [],
          transfers: parsed.transfers ?? [],
          installmentPlans: parsed.installmentPlans ?? [],
          scheduledBills: parsed.scheduledBills ?? [],
          lastAccountId: parsed.lastAccountId ?? '',
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const closeTopLayer = () => {
      if (entryOpen) {
        setEntryOpen(false);
        return;
      }
      if (settingsPanel) {
        setSettingsPanel(null);
        return;
      }
      if (recordsOrigin) {
        setTab(recordsOrigin);
        setRecordsOrigin(null);
        window.requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ top: recordsOriginScroll.current }));
      }
    };
    window.addEventListener('popstate', closeTopLayer);
    return () => window.removeEventListener('popstate', closeTopLayer);
  }, [entryOpen, recordsOrigin, settingsPanel]);

  useEffect(() => {
    let disposed = false;
    let removeListener: (() => Promise<void>) | undefined;
    void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (entryOpen) {
        dismissEntry();
        return;
      }
      if (settingsPanel) {
        dismissSettings();
        return;
      }
      if (recordsOrigin) {
        if (window.history.state?.ledgerLayer === 'records-detail') window.history.back();
        else {
          setTab(recordsOrigin);
          setRecordsOrigin(null);
          window.requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ top: recordsOriginScroll.current }));
        }
        return;
      }
      if (canGoBack) window.history.back();
      else void CapacitorApp.exitApp();
    }).then((handle) => {
      if (disposed) void handle.remove();
      else removeListener = handle.remove;
    });
    return () => {
      disposed = true;
      if (removeListener) void removeListener();
    };
  }, [entryOpen, recordsOrigin, settingsPanel]);

  const monthTransactions = useMemo(
    () => data.transactions.filter((transaction) => transaction.date.startsWith(monthKey(month))).sort((a, b) => b.createdAt - a.createdAt),
    [data.transactions, month],
  );
  const totals = useMemo(() => monthTransactions.reduce(
    (sum, transaction) => ({ ...sum, [transaction.type]: sum[transaction.type] + transaction.amount }),
    { expense: 0, income: 0 },
  ), [monthTransactions]);
  const budgetPercent = Math.min(100, data.budget > 0 ? Math.round((totals.expense / data.budget) * 100) : 0);
  const todayExpenses = data.transactions.filter((transaction) => transaction.date === relativeDate(0) && transaction.type === 'expense');
  const todaySpent = todayExpenses.reduce((sum, item) => sum + item.amount, 0);
  const expenseCategoryOptions = useMemo(() => [...expenseCategories, ...data.customCategories.filter((item) => item.type === 'expense').map(customCategoryMeta)], [data.customCategories]);
  const incomeCategoryOptions = useMemo(() => [...incomeCategories, ...data.customCategories.filter((item) => item.type === 'income').map(customCategoryMeta)], [data.customCategories]);
  const enabledExpense = expenseCategoryOptions.filter((item) => !data.hiddenCategories.includes(`expense:${item.name}`));
  const enabledIncome = incomeCategoryOptions.filter((item) => !data.hiddenCategories.includes(`income:${item.name}`));

  function accountAmount(account: Account) {
    const accountTransactions = data.transactions.filter((tx) => tx.accountId === account.id);
    const incoming = accountTransactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const outgoing = accountTransactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const transferIn = data.transfers.filter((item) => item.toAccountId === account.id && item.kind === 'transfer').reduce((sum, item) => sum + item.amount, 0);
    const transferOut = data.transfers.filter((item) => item.fromAccountId === account.id).reduce((sum, item) => sum + item.amount, 0);
    if (account.type === 'credit') {
      const fees = data.installmentPlans.filter((plan) => plan.accountId === account.id).reduce((sum, plan) => sum + plan.feeTotal, 0);
      const repaid = data.transfers.filter((item) => item.toAccountId === account.id && item.kind === 'repayment').reduce((sum, item) => sum + item.amount, 0);
      return Math.max(0, account.openingBalance + outgoing - incoming + fees - repaid);
    }
    if (!account.trackBalance) return 0;
    return account.openingBalance + incoming - outgoing + transferIn - transferOut;
  }

  const accountSnapshots = data.accounts.map((account) => ({ account, amount: accountAmount(account) }));
  const trackedAssets = accountSnapshots.filter(({ account }) => account.type !== 'credit' && account.trackBalance).reduce((sum, item) => sum + item.amount, 0);
  const creditOutstanding = accountSnapshots.filter(({ account }) => account.type === 'credit').reduce((sum, item) => sum + item.amount, 0);
  const netAssets = trackedAssets - creditOutstanding;
  const now = new Date();
  const creditDueSoon = accountSnapshots.filter(({ account, amount }) => account.type === 'credit' && amount > 0 && daysBetween(now, nextDueDate(account.dueDay, now)) <= 7).reduce((sum, item) => sum + item.amount, 0);
  const billsDueSoon = data.scheduledBills.filter((bill) => bill.enabled && daysBetween(now, nextDueDate(bill.dueDay, now)) <= 7).reduce((sum, bill) => sum + bill.amount, 0);
  const dueSoon = creditDueSoon + billsDueSoon;
  const pendingReimbursement = data.transactions.filter((tx) => tx.reimbursementStatus === 'pending').reduce((sum, tx) => sum + tx.amount, 0);
  const activeInstallments = data.installmentPlans.filter((plan) => {
    const start = new Date(`${plan.startDate}T12:00:00`);
    const elapsedMonths = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
    return elapsedMonths >= 0 && elapsedMonths < plan.periods;
  });
  const installmentMonthly = activeInstallments.reduce((sum, plan) => sum + (plan.totalAmount + plan.feeTotal) / plan.periods, 0);

  const categoryTotals = useMemo(() => [...new Set(monthTransactions.filter((tx) => tx.type === 'expense').map((tx) => tx.category))].map((name) => ({
    ...categoryMeta(name, 'expense', data.customCategories),
    amount: monthTransactions.filter((tx) => tx.type === 'expense' && tx.category === name).reduce((sum, tx) => sum + tx.amount, 0),
  })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount), [data.customCategories, monthTransactions]);
  const accountExpenseTotals = useMemo(() => [...new Set(monthTransactions.filter((tx) => tx.type === 'expense').map((tx) => tx.accountId))].map((accountId) => ({
    accountId,
    name: data.accounts.find((item) => item.id === accountId)?.name || '未指定账户',
    amount: monthTransactions.filter((tx) => tx.type === 'expense' && tx.accountId === accountId).reduce((sum, tx) => sum + tx.amount, 0),
  })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount), [data.accounts, monthTransactions]);

  const donutGradient = useMemo(() => {
    if (!totals.expense) return '#edf0ed';
    let cursor = 0;
    const pieces = categoryTotals.map((item) => {
      const start = cursor;
      cursor += (item.amount / totals.expense) * 100;
      return `${item.color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
    });
    return `conic-gradient(${pieces.join(',')})`;
  }, [categoryTotals, totals.expense]);

  const dailyTrend = useMemo(() => {
    const days: { key: string; label: string; amount: number }[] = [];
    const now = new Date();
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1, 12);
    const latestDay = monthKey(month) === monthKey(now) ? new Date(now) : new Date(month.getFullYear(), month.getMonth() + 1, 0, 12);
    latestDay.setHours(12, 0, 0, 0);
    const end = new Date(latestDay);
    end.setDate(latestDay.getDate() - trendWindow * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    if (start < monthStart) start.setTime(monthStart.getTime());
    for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const key = dateKey(day);
      days.push({ key, label: `${day.getMonth() + 1}/${day.getDate()}`, amount: data.transactions.filter((tx) => tx.type === 'expense' && tx.date === key).reduce((sum, tx) => sum + tx.amount, 0) });
    }
    return days;
  }, [data.transactions, month, trendWindow]);
  const trendCanGoEarlier = dailyTrend[0]?.key !== dateKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const trendCanGoLater = trendWindow > 0;
  const trendRange = dailyTrend.length ? `${dailyTrend[0].label}—${dailyTrend.at(-1)?.label}` : '';

  const visibleRecords = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return monthTransactions.filter((tx) => {
      const matchesType = recordFilter === 'all' || tx.type === recordFilter;
      const matchesDate = recordDateFilter === 'all' || tx.date === recordDateFilter;
      const matchesCategory = !recordCategoryFilter || (tx.category === recordCategoryFilter.name && tx.type === recordCategoryFilter.type);
      const matchesAccount = recordAccountFilter === 'all' || tx.accountId === recordAccountFilter;
      const matchesQuery = !normalized || tx.note.toLowerCase().includes(normalized) || tx.category.toLowerCase().includes(normalized);
      return matchesType && matchesDate && matchesCategory && matchesAccount && matchesQuery;
    }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [monthTransactions, query, recordAccountFilter, recordCategoryFilter, recordDateFilter, recordFilter]);

  const recordGroups = useMemo(() => {
    const groups: Array<{ date: string; transactions: Transaction[] }> = [];
    visibleRecords.forEach((transaction) => {
      const current = groups.at(-1);
      if (current?.date === transaction.date) current.transactions.push(transaction);
      else groups.push({ date: transaction.date, transactions: [transaction] });
    });
    return groups;
  }, [visibleRecords]);

  const accent = data.theme === 'custom' ? data.customAccent : themeOptions.find((item) => item.id === data.theme)?.accent ?? themeOptions[0].accent;
  const themeStyle = {
    '--accent': accent,
    '--accent-strong': darkenHex(accent, .28),
    '--accent-soft': mixHexWithWhite(accent, .84),
    '--accent-text': contrastText(accent),
  } as CSSProperties;
  const currentAmount = Number(amount || 0);
  const evaluatedAmount = baseAmount === null || !operator ? currentAmount : operator === '+' ? baseAmount + currentAmount : baseAmount - currentAmount;
  const entryAccount = data.accounts.find((item) => item.id === selectedAccountId);

  function resetCalculator(nextAmount = '') {
    setAmount(nextAmount);
    setBaseAmount(null);
    setOperator(null);
  }

  function changeMonth(nextMonth: Date) {
    setMonth(nextMonth);
    setTrendWindow(0);
  }

  function openRecordDetail(origin: Exclude<Tab, 'records'>) {
    recordsOriginScroll.current = pageScrollRef.current?.scrollTop ?? 0;
    pushLayer('records-detail');
    setRecordsOrigin(origin);
    setQuery('');
    setTab('records');
    window.requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ top: 0 }));
  }

  function openAllRecords() {
    setRecordFilter('all');
    setRecordDateFilter('all');
    setRecordCategoryFilter(null);
    setRecordAccountFilter('all');
    openRecordDetail('home');
  }

  function openTodayRecords() {
    const now = new Date();
    changeMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setRecordFilter('expense');
    setRecordAccountFilter('all');
    setRecordDateFilter(relativeDate(0));
    setRecordCategoryFilter(null);
    openRecordDetail('home');
  }

  function openCategoryRecords(name: string, type: TxType) {
    setRecordFilter(type);
    setRecordDateFilter('all');
    setRecordCategoryFilter({ name, type });
    setRecordAccountFilter('all');
    openRecordDetail('stats');
  }

  function openDateRecords(date: string) {
    setMonth(new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, 1));
    setRecordFilter('all');
    setRecordDateFilter(date);
    setRecordCategoryFilter(null);
    setRecordAccountFilter('all');
    openRecordDetail('stats');
  }

  function openAccountRecords(accountId: string) {
    setRecordFilter('expense');
    setRecordDateFilter('all');
    setRecordCategoryFilter(null);
    setRecordAccountFilter(accountId);
    openRecordDetail('stats');
  }

  function pushLayer(layer: 'entry' | 'settings' | 'records-detail') {
    window.history.pushState({ ...window.history.state, ledgerLayer: layer }, '');
  }

  function clearRecordOrigin() {
    if (window.history.state?.ledgerLayer === 'records-detail') {
      const nextState = { ...window.history.state };
      delete nextState.ledgerLayer;
      window.history.replaceState(nextState, '');
    }
    setRecordsOrigin(null);
  }

  function switchTab(nextTab: Exclude<Tab, 'records'>) {
    clearRecordOrigin();
    setTab(nextTab);
  }

  function dismissRecordDetail() {
    if (window.history.state?.ledgerLayer === 'records-detail') window.history.back();
    else if (recordsOrigin) {
      setTab(recordsOrigin);
      setRecordsOrigin(null);
      window.requestAnimationFrame(() => pageScrollRef.current?.scrollTo({ top: recordsOriginScroll.current }));
    }
  }

  function dismissEntry() {
    if (window.history.state?.ledgerLayer === 'entry') window.history.back();
    else setEntryOpen(false);
  }

  function openSettings(panel: Exclude<SettingsPanel, null>) {
    pushLayer('settings');
    setSettingsPanel(panel);
  }

  function dismissSettings() {
    if (window.history.state?.ledgerLayer === 'settings') window.history.back();
    else setSettingsPanel(null);
  }

  function openNew(type: TxType = 'expense') {
    const options = type === 'expense' ? enabledExpense : enabledIncome;
    const preferred = type === 'expense' ? data.lastCategory : options[0]?.name;
    setEditingId(null);
    setDraftType(type);
    setCategory(options.some((item) => item.name === preferred) ? preferred : options[0]?.name ?? '其他');
    resetCalculator();
    setNote('');
    setTxDate(relativeDate(0));
    const preferredAccount = data.accounts.some((item) => item.id === data.lastAccountId) ? data.lastAccountId : data.accounts[0]?.id ?? '';
    setSelectedAccountId(preferredAccount);
    setReimbursementStatus('none');
    setInstallmentEnabled(false);
    setInstallmentPeriods(3);
    setInstallmentFee('');
    pushLayer('entry');
    setEntryOpen(true);
  }

  function openEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setDraftType(transaction.type);
    setCategory(transaction.category);
    resetCalculator(String(transaction.amount));
    setNote(transaction.note === transaction.category ? '' : transaction.note);
    setTxDate(transaction.date);
    setSelectedAccountId(transaction.accountId || '');
    setReimbursementStatus(transaction.reimbursementStatus || 'none');
    const plan = data.installmentPlans.find((item) => item.transactionId === transaction.id);
    setInstallmentEnabled(Boolean(plan));
    setInstallmentPeriods(plan?.periods ?? 3);
    setInstallmentFee(plan?.feeTotal ? String(plan.feeTotal) : '');
    pushLayer('entry');
    setEntryOpen(true);
  }

  function switchDraftType(type: TxType) {
    setDraftType(type);
    const options = type === 'expense' ? enabledExpense : enabledIncome;
    if (!options.some((item) => item.name === category)) setCategory(options[0]?.name ?? '其他');
  }

  function pressKey(key: string) {
    if (key === 'backspace') {
      setAmount((value) => value.slice(0, -1));
      return;
    }
    setAmount((value) => {
      if (key === '.' && value.includes('.')) return value;
      if (key === '.' && !value) return '0.';
      if (value.includes('.') && value.split('.')[1].length >= 2) return value;
      if (value.replace('.', '').length >= 8) return value;
      if (value === '0' && key !== '.') return key;
      return value + key;
    });
  }

  function pressOperator(nextOperator: '+' | '-') {
    if (!amount && baseAmount === null) return;
    if (baseAmount === null) setBaseAmount(currentAmount);
    else if (operator && amount) setBaseAmount(evaluatedAmount);
    setOperator(nextOperator);
    setAmount('');
  }

  function saveTransaction() {
    if (operator && !amount) {
      setToast('请继续输入金额');
      return;
    }
    const parsed = Number(evaluatedAmount.toFixed(2));
    if (!parsed || parsed <= 0) {
      setToast('请输入大于 0 的金额');
      return;
    }
    const selectedAccount = data.accounts.find((item) => item.id === selectedAccountId);
    const shouldInstallment = draftType === 'expense' && installmentEnabled && selectedAccount?.type === 'credit';
    const feeTotal = Math.max(0, Number(installmentFee || 0));
    if (editingId) {
      const existingPlanId = data.installmentPlans.find((plan) => plan.transactionId === editingId)?.id;
      const editPlanId = existingPlanId || `plan-${Date.now()}`;
      setData((current) => ({
        ...current,
        lastCategory: draftType === 'expense' ? category : current.lastCategory,
        lastAccountId: selectedAccountId || current.lastAccountId,
        transactions: current.transactions.map((tx) => tx.id === editingId ? { ...tx, type: draftType, amount: parsed, category, note: note.trim() || category, date: txDate, accountId: selectedAccountId, reimbursementStatus, installmentPlanId: shouldInstallment ? editPlanId : undefined } : tx),
        installmentPlans: shouldInstallment
          ? [...current.installmentPlans.filter((plan) => plan.transactionId !== editingId), { id: editPlanId, transactionId: editingId, accountId: selectedAccountId, title: note.trim() || category, totalAmount: parsed, feeTotal, periods: installmentPeriods, startDate: txDate }]
          : current.installmentPlans.filter((plan) => plan.transactionId !== editingId),
      }));
      setToast('这笔记录已更新');
    } else {
      const timestamp = Date.now();
      const transactionId = `tx-${timestamp}`;
      const planId = shouldInstallment ? `plan-${timestamp}` : undefined;
      const created: Transaction = { id: transactionId, type: draftType, amount: parsed, category, note: note.trim() || category, date: txDate, createdAt: timestamp, accountId: selectedAccountId, reimbursementStatus, installmentPlanId: planId };
      const plan: InstallmentPlan | null = shouldInstallment ? { id: planId!, transactionId, accountId: selectedAccountId, title: note.trim() || category, totalAmount: parsed, feeTotal, periods: installmentPeriods, startDate: txDate } : null;
      setData((current) => ({ ...current, lastCategory: draftType === 'expense' ? category : current.lastCategory, lastAccountId: selectedAccountId || current.lastAccountId, transactions: [created, ...current.transactions], installmentPlans: plan ? [plan, ...current.installmentPlans] : current.installmentPlans }));
      setMonth(new Date(Number(txDate.slice(0, 4)), Number(txDate.slice(5, 7)) - 1, 1));
      setToast(shouldInstallment ? `${installmentPeriods} 期分期已建立` : `${draftType === 'expense' ? '支出' : '收入'}已记下`);
    }
    dismissEntry();
  }

  function deleteTransaction() {
    if (!editingId || !window.confirm('确定删除这笔记录吗？')) return;
    setData((current) => ({ ...current, transactions: current.transactions.filter((tx) => tx.id !== editingId), installmentPlans: current.installmentPlans.filter((plan) => plan.transactionId !== editingId) }));
    dismissEntry();
    setToast('记录已删除');
  }

  function exportCsv() {
    if (!data.transactions.length) {
      setToast('还没有可导出的账目');
      return;
    }
    const rows = [['日期', '类型', '分类', '备注', '金额', '账户', '报销状态', '分期'], ...data.transactions.map((tx) => {
      const account = data.accounts.find((item) => item.id === tx.accountId);
      const plan = data.installmentPlans.find((item) => item.transactionId === tx.id);
      return [tx.date, tx.type === 'expense' ? '支出' : '收入', tx.category, tx.note, String(tx.amount), account?.name || '未指定账户', tx.reimbursementStatus === 'pending' ? '待报销' : tx.reimbursementStatus === 'reimbursed' ? '已报销' : '', plan ? `${plan.periods}期` : ''];
    })];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `拾账账户版-${dateKey(new Date())}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast('账单已导出');
  }

  function clearTransactions() {
    if (!data.transactions.length) {
      setToast('当前已经是空账本');
      return;
    }
    if (!window.confirm('确定清空所有账目吗？此操作无法撤销。')) return;
    setData((current) => ({ ...current, transactions: [], transfers: [], installmentPlans: [] }));
    setToast('所有账目已清空');
  }

  function toggleCategory(type: TxType, name: string) {
    const key = `${type}:${name}`;
    const enabled = type === 'expense' ? enabledExpense : enabledIncome;
    if (!data.hiddenCategories.includes(key) && enabled.length <= 1) {
      setToast('至少保留一个分类');
      return;
    }
    setData((current) => ({ ...current, hiddenCategories: current.hiddenCategories.includes(key) ? current.hiddenCategories.filter((item) => item !== key) : [...current.hiddenCategories, key] }));
  }

  function addCustomCategory(event: FormEvent, type: TxType) {
    event.preventDefault();
    const name = newCategoryNames[type].trim();
    if (!name) {
      setToast('请输入分类名称');
      return;
    }
    const options = type === 'expense' ? expenseCategoryOptions : incomeCategoryOptions;
    if (options.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setToast('这个分类已经存在');
      return;
    }
    const created: CustomCategory = { id: `category-${type}-${Date.now()}`, type, name };
    setData((current) => ({ ...current, customCategories: [...current.customCategories, created] }));
    setNewCategoryNames((current) => ({ ...current, [type]: '' }));
    setToast(`${name}已添加`);
  }

  function deleteCustomCategory(category: Category, type: TxType) {
    if (!category.customId) return;
    if (!window.confirm(`删除“${category.name}”分类吗？已有账目会继续保留。`)) return;
    const key = `${type}:${category.name}`;
    setData((current) => ({
      ...current,
      customCategories: current.customCategories.filter((item) => item.id !== category.customId),
      hiddenCategories: current.hiddenCategories.filter((item) => item !== key),
      lastCategory: current.lastCategory === category.name ? '餐饮' : current.lastCategory,
    }));
    setToast('自定义分类已删除');
  }

  function openAccountPanel(type: AccountType = 'payment') {
    setAccountDraft({ name: '', type, openingBalance: '', trackBalance: type === 'bank' || type === 'cash', creditLimit: '', statementDay: '5', dueDay: '25', last4: '' });
    openSettings('account');
  }

  function saveAccount(event: FormEvent) {
    event.preventDefault();
    const name = accountDraft.name.trim();
    if (!name) {
      setToast('请填写账户名称');
      return;
    }
    if (data.accounts.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      setToast('这个账户已经存在');
      return;
    }
    const id = `account-${Date.now()}`;
    const isCredit = accountDraft.type === 'credit';
    const created: Account = {
      id,
      name,
      type: accountDraft.type,
      openingBalance: Math.max(0, Number(accountDraft.openingBalance || 0)),
      trackBalance: isCredit ? true : accountDraft.trackBalance,
      creditLimit: isCredit ? Math.max(0, Number(accountDraft.creditLimit || 0)) : 0,
      statementDay: Math.max(1, Math.min(28, Number(accountDraft.statementDay || 1))),
      dueDay: Math.max(1, Math.min(28, Number(accountDraft.dueDay || 1))),
      last4: accountDraft.last4.replace(/\D/g, '').slice(-4),
    };
    setData((current) => ({ ...current, accounts: [...current.accounts, created], lastAccountId: current.lastAccountId || id }));
    setSelectedAccountId(id);
    dismissSettings();
    setToast(`${name}已添加`);
  }

  function deleteAccount(account: Account) {
    if (!window.confirm(`删除“${account.name}”吗？已有记录会保留为未指定账户。`)) return;
    setData((current) => ({
      ...current,
      accounts: current.accounts.filter((item) => item.id !== account.id),
      transactions: current.transactions.map((tx) => tx.accountId === account.id ? { ...tx, accountId: '' } : tx),
      scheduledBills: current.scheduledBills.map((bill) => bill.accountId === account.id ? { ...bill, accountId: '' } : bill),
      lastAccountId: current.lastAccountId === account.id ? '' : current.lastAccountId,
    }));
    setToast('账户已删除，历史账目仍保留');
  }

  function saveBill(event: FormEvent) {
    event.preventDefault();
    const amountValue = Math.max(0, Number(billDraft.amount || 0));
    if (!billDraft.title.trim() || !amountValue) {
      setToast('请填写名称和金额');
      return;
    }
    const created: ScheduledBill = { id: `bill-${Date.now()}`, title: billDraft.title.trim(), amount: amountValue, dueDay: Math.max(1, Math.min(28, Number(billDraft.dueDay || 1))), accountId: billDraft.accountId, category: billDraft.category, enabled: true };
    setData((current) => ({ ...current, scheduledBills: [...current.scheduledBills, created] }));
    dismissSettings();
    setToast('固定账单已添加');
  }

  function openBillPanel() {
    setBillDraft({ title: '', amount: '', dueDay: '1', accountId: data.accounts[0]?.id ?? '', category: '居住' });
    openSettings('bill');
  }

  function openRepayment(accountId: string) {
    setRepaymentAccountId(accountId);
    setRepaymentFromId(data.accounts.find((item) => item.type !== 'credit' && item.id !== accountId)?.id ?? 'external');
    setRepaymentAmount('');
    setRepaymentDate(relativeDate(0));
    openSettings('repayment');
  }

  function saveRepayment(event: FormEvent) {
    event.preventDefault();
    const amountValue = Math.max(0, Number(repaymentAmount || 0));
    const creditAccount = data.accounts.find((item) => item.id === repaymentAccountId && item.type === 'credit');
    if (!creditAccount || !amountValue) {
      setToast('请选择信用账户并填写金额');
      return;
    }
    const transfer: Transfer = { id: `transfer-${Date.now()}`, kind: 'repayment', amount: amountValue, fromAccountId: repaymentFromId, toAccountId: creditAccount.id, date: repaymentDate, note: `偿还${creditAccount.name}`, createdAt: Date.now() };
    setData((current) => ({ ...current, transfers: [transfer, ...current.transfers] }));
    dismissSettings();
    setToast('还款已记录，不会重复计入支出');
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast('请选择图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast('图片请不要超过 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) return;
        context.drawImage(
          image,
          (image.naturalWidth - sourceSize) / 2,
          (image.naturalHeight - sourceSize) / 2,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size,
        );
        setData((current) => ({ ...current, avatarImage: canvas.toDataURL('image/jpeg', .86) }));
        setToast('头像已更新');
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const renderTransaction = (transaction: Transaction) => {
    const meta = categoryMeta(transaction.category, transaction.type, data.customCategories);
    const account = data.accounts.find((item) => item.id === transaction.accountId);
    const Icon = meta.icon;
    return (
      <button className="transaction" key={transaction.id} onClick={() => openEdit(transaction)}>
        <span className="category-icon" style={{ background: meta.soft, color: meta.color }}><Icon size={19} strokeWidth={2} /></span>
        <span className="transaction-copy"><b>{transaction.note || transaction.category}{transaction.reimbursementStatus !== 'none' && <i className="status-chip">{transaction.reimbursementStatus === 'pending' ? '待报销' : '已报销'}</i>}{transaction.installmentPlanId && <i className="status-chip">分期</i>}</b><small>{transaction.category} · {account?.name || '未指定账户'} · {friendlyDate(transaction.date)}</small></span>
        <strong className={transaction.type === 'income' ? 'positive' : ''}>{transaction.type === 'income' ? '+' : '−'}{formatMoney(transaction.amount)}</strong>
      </button>
    );
  };

  const emptyState = (text: string, withAction = false) => (
    <div className="empty-state">
      <span className="empty-mark"><ReceiptText size={25} /></span>
      <b>{text}</b><span>从第一笔开始，慢慢形成自己的账本</span>
      {withAction && <button onClick={() => openNew()}>记第一笔</button>}
    </div>
  );

  const activeThemeName = data.theme === 'custom' ? '自定义配色' : themeOptions.find((item) => item.id === data.theme)?.name;

  return (
    <main className="app-shell">
      <section className="phone-surface" style={themeStyle}>
        <div className="page-scroll" ref={pageScrollRef}>
          {tab === 'home' && (
            <div className="page page-home">
              <header className="brand-topbar">
                <div className="brand-lockup"><span className="brand-mark"><img src="/app-icon.png" alt="" /></span><div><b>拾账 · 账户版</b><span>看清今天，也安排好未来</span></div></div>
                <button className="avatar" onClick={() => switchTab('profile')} aria-label="打开个人设置">{data.avatarImage ? <img src={data.avatarImage} alt="我的头像" /> : data.avatar || '我'}</button>
              </header>
              <div className="home-period"><div><p className="eyebrow">LEDGER</p><h1>{month.getMonth() + 1} 月账本</h1></div><MonthControl value={month} onChange={changeMonth} /></div>
              <button className="today-card" onClick={() => todayExpenses.length ? openTodayRecords() : openNew()} aria-label={todayExpenses.length ? `今日花费 ${formatMoney(todaySpent)}，查看今日明细` : '今日还没有支出，记下第一笔'}>
                <span className="today-heading"><span><small>TODAY</small><b>今日花费</b></span><CalendarDays size={21} /></span>
                <strong>{formatMoney(todaySpent)}</strong>
                <span className="today-footer"><span>{todayExpenses.length ? `今日 ${todayExpenses.length} 笔支出` : '今天还没有支出'}</span><b>{todayExpenses.length ? '查看今日明细' : '记下今天第一笔'}<ChevronRight size={16} /></b></span>
              </button>
              <section className="month-summary" aria-label="本月收支概览">
                <div><span>本月结余</span><strong>{formatMoney(totals.income - totals.expense)}</strong></div>
                <div><span><ArrowDownLeft size={13} />收入</span><strong>{formatMoney(totals.income)}</strong></div>
                <div><span><ArrowUpRight size={13} />支出</span><strong>{formatMoney(totals.expense)}</strong></div>
              </section>
              <section className="money-radar" aria-label="职场现金流提醒">
                <div className="radar-heading"><div><p className="eyebrow">MONEY RADAR</p><h2>接下来要付的钱</h2></div><button onClick={() => switchTab('accounts')}>管理账户<ChevronRight size={15} /></button></div>
                <div className="radar-grid">
                  <button onClick={() => switchTab('accounts')}><span className="radar-icon"><CreditCard size={18} /></span><span><small>信用待还</small><strong>{formatMoney(creditOutstanding)}</strong></span></button>
                  <button onClick={() => switchTab('accounts')}><span className="radar-icon"><CalendarDays size={18} /></span><span><small>未来 7 天待付</small><strong>{formatMoney(dueSoon)}</strong></span></button>
                </div>
                {data.accounts.length ? <div className="radar-note"><span>分期月供 {formatMoney(installmentMonthly)}</span><span>待报销 {formatMoney(pendingReimbursement)}</span></div> : <button className="account-onboarding" onClick={() => switchTab('accounts')}><span><Landmark size={18} /><b>添加你的第一个账户</b></span><small>银行卡、微信、支付宝或信用卡</small><ChevronRight size={18} /></button>}
              </section>
              <button className={`budget-strip ${data.budget ? '' : 'is-empty'}`} onClick={() => openSettings('budget')}>
                {data.budget ? <><span className="budget-line"><span>{month.getMonth() + 1} 月预算</span><b>已用 {budgetPercent}%</b></span><span className="progress"><i style={{ width: `${budgetPercent}%` }} /></span><small>{data.budget - totals.expense >= 0 ? `还可以花 ${formatMoney(data.budget - totals.expense)}` : `已超出 ${formatMoney(totals.expense - data.budget)}`}</small></> : <><span><Settings2 size={18} />设置月预算</span><small>给本月支出定一个上限</small><ChevronRight size={18} /></>}
              </button>
              <section className="recent-section">
                <div className="section-heading"><div><p className="eyebrow">RECENT</p><h2>最近记录</h2></div>{monthTransactions.length > 0 && <button onClick={openAllRecords}>全部记录</button>}</div>
                <div className="transaction-list home-list">{monthTransactions.length ? monthTransactions.slice(0, 6).map(renderTransaction) : emptyState('账本还是空的', true)}</div>
              </section>
            </div>
          )}

          {tab === 'accounts' && (
            <div className="page accounts-page">
              <header className="page-header"><div><p className="eyebrow">ACCOUNTS</p><h1>我的账户</h1></div><button className="header-action" onClick={() => openAccountPanel()}><Plus size={17} />添加</button></header>
              <section className="account-overview-card"><span><small>净资产</small><strong>{formatMoney(netAssets)}</strong></span><div><span>已记录资产 {formatMoney(trackedAssets)}</span><span>信用待还 {formatMoney(creditOutstanding)}</span></div></section>
              {data.accounts.length ? <>
                <section className="account-list-section">
                  <div className="section-heading"><div><p className="eyebrow">MY MONEY</p><h2>账户清单</h2></div><button onClick={() => openAccountPanel()}>添加账户</button></div>
                  <div className="account-list">{accountSnapshots.map(({ account, amount }) => {
                    const isCredit = account.type === 'credit';
                    const available = Math.max(0, account.creditLimit - amount);
                    return <article className={`account-item ${isCredit ? 'credit' : ''}`} key={account.id}>
                      <div className="account-main"><span className="account-type-icon">{isCredit ? <CreditCard /> : account.type === 'bank' ? <Landmark /> : account.type === 'cash' ? <Banknote /> : <WalletCards />}</span><span><b>{account.name}</b><small>{accountTypeLabels[account.type]}{account.last4 ? ` · ${account.last4}` : ''}</small></span><strong>{account.trackBalance || isCredit ? formatMoney(amount) : '仅记付款方式'}</strong></div>
                      {isCredit && <div className="credit-meta"><span>可用额度 {account.creditLimit ? formatMoney(available) : '未设置'}</span><span>{account.statementDay} 日出账 · {account.dueDay} 日还款</span></div>}
                      <div className="account-actions">{isCredit && <button onClick={() => openRepayment(account.id)}><CircleDollarSign size={14} />记还款</button>}<button className="quiet-danger" onClick={() => deleteAccount(account)}><Trash2 size={14} />删除</button></div>
                    </article>;
                  })}</div>
                </section>
                <section className="account-tools">
                  <div className="section-heading"><div><p className="eyebrow">UPCOMING</p><h2>固定账单</h2></div><button onClick={openBillPanel}>添加</button></div>
                  {data.scheduledBills.length ? <div className="bill-list">{data.scheduledBills.map((bill) => <div key={bill.id}><span className="bill-icon"><Repeat2 size={17} /></span><span><b>{bill.title}</b><small>每月 {bill.dueDay} 日 · {data.accounts.find((item) => item.id === bill.accountId)?.name || '未指定账户'}</small></span><strong>{formatMoney(bill.amount)}</strong><button aria-label={`删除${bill.title}`} onClick={() => setData((current) => ({ ...current, scheduledBills: current.scheduledBills.filter((item) => item.id !== bill.id) }))}><X size={15} /></button></div>)}</div> : <button className="tool-empty" onClick={openBillPanel}><BellRing size={20} /><span><b>添加房租、会员等固定支出</b><small>到期前会进入首页的未来待付</small></span><ChevronRight size={17} /></button>}
                </section>
                {activeInstallments.length > 0 && <section className="account-tools"><div className="section-heading"><div><p className="eyebrow">INSTALLMENTS</p><h2>进行中的分期</h2></div><span>{activeInstallments.length} 项</span></div><div className="installment-list">{activeInstallments.map((plan) => <div key={plan.id}><span className="bill-icon"><CalendarClock size={17} /></span><span><b>{plan.title}</b><small>{plan.periods} 期 · {data.accounts.find((item) => item.id === plan.accountId)?.name || '信用账户'}</small></span><strong>{formatMoney((plan.totalAmount + plan.feeTotal) / plan.periods)}<small>/月</small></strong></div>)}</div></section>}
              </> : <section className="account-empty"><span><WalletCards size={28} /></span><h2>把钱放进不同账户里看</h2><p>添加微信、支付宝、银行卡或信用卡。普通账户可以只记录付款方式，信用账户会帮你管理账单与还款。</p><button onClick={() => openAccountPanel()}><Plus size={17} />添加第一个账户</button></section>}
            </div>
          )}

          {tab === 'stats' && (
            <div className="page">
              <header className="page-header"><div><p className="eyebrow">INSIGHTS</p><h1>收支统计</h1></div><MonthControl value={month} onChange={changeMonth} /></header>
              <section className="stats-summary"><div><span>支出</span><strong>{formatMoney(totals.expense)}</strong></div><div><span>收入</span><strong>{formatMoney(totals.income)}</strong></div><div><span>结余</span><strong>{formatMoney(totals.income - totals.expense)}</strong></div></section>
              <section className="panel analysis-panel">
                <div className="panel-title"><div><p className="eyebrow">BREAKDOWN</p><h2>支出去向</h2></div><span>{monthTransactions.filter((tx) => tx.type === 'expense').length} 笔</span></div>
                {totals.expense ? <><div className="donut-layout"><div className="donut" style={{ background: donutGradient }}><div><span>总支出</span><b>{formatMoney(totals.expense, 0)}</b></div></div><div className="top-category"><span>最高支出</span><b>{categoryTotals[0]?.name}</b><strong>{categoryTotals[0] ? Math.round(categoryTotals[0].amount / totals.expense * 100) : 0}%</strong></div></div><div className="category-breakdown">{categoryTotals.map((item) => <button key={item.name} onClick={() => openCategoryRecords(item.name, 'expense')} aria-label={`查看${item.name}明细`}><i style={{ background: item.color }} /><span>{item.name}</span><div className="mini-track"><i style={{ width: `${item.amount / totals.expense * 100}%`, background: item.color }} /></div><b>{formatMoney(item.amount, 0)}</b><ChevronRight size={14} /></button>)}</div></> : emptyState('本月还没有支出')}
              </section>
              {accountExpenseTotals.length > 0 && <section className="panel"><div className="panel-title"><div><p className="eyebrow">BY ACCOUNT</p><h2>账户支出</h2></div><span>{accountExpenseTotals.length} 个账户</span></div><div className="account-breakdown">{accountExpenseTotals.map((item) => <button key={item.accountId || 'unspecified'} onClick={() => openAccountRecords(item.accountId)}><span className="radar-icon"><WalletCards size={17} /></span><span><b>{item.name}</b><small>{totals.expense ? Math.round(item.amount / totals.expense * 100) : 0}% 的本月支出</small></span><strong>{formatMoney(item.amount)}</strong><ChevronRight size={15} /></button>)}</div></section>}
              <section className="panel trend-panel"><div className="panel-title"><div><p className="eyebrow">7 DAYS</p><h2>每日趋势</h2></div><div className="trend-navigation"><button disabled={!trendCanGoEarlier} onClick={() => setTrendWindow((current) => current + 1)} aria-label="查看更早七天"><ChevronLeft size={15} /></button><span>{trendRange}</span><button disabled={!trendCanGoLater} onClick={() => setTrendWindow((current) => Math.max(0, current - 1))} aria-label="查看较新七天"><ChevronRight size={15} /></button></div></div><div className="bar-chart">{dailyTrend.map((day) => { const max = Math.max(...dailyTrend.map((item) => item.amount), 1); return <button className="bar-column" key={day.key} onClick={() => openDateRecords(day.key)} aria-label={`查看${day.label}明细`}><span>{day.amount ? formatMoney(day.amount, 0) : ''}</span><i style={{ height: `${Math.max(day.amount ? 12 : 3, day.amount / max * 92)}px` }} /><small>{day.label}</small></button>; })}</div></section>
            </div>
          )}

          {tab === 'records' && (
            <div className="page">
              <header className="page-header"><div className="records-heading">{recordsOrigin && <button className="detail-back" onClick={dismissRecordDetail} aria-label="返回上一页"><ChevronLeft size={19} /></button>}<div><p className="eyebrow">LEDGER</p><h1>{recordCategoryFilter ? `${recordCategoryFilter.name}明细` : recordDateFilter !== 'all' ? `${friendlyDate(recordDateFilter)}明细` : recordAccountFilter !== 'all' ? `${data.accounts.find((item) => item.id === recordAccountFilter)?.name || '未指定账户'}明细` : '全部明细'}</h1></div></div><MonthControl value={month} onChange={(next) => { changeMonth(next); setRecordDateFilter('all'); }} /></header>
              <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索分类或备注" aria-label="搜索账单" />{query && <button onClick={() => setQuery('')} aria-label="清空搜索"><X size={16} /></button>}</label>
              <div className="filter-row"><ListFilter size={17} />{recordDateFilter !== 'all' && <button className="active" onClick={() => setRecordDateFilter('all')}>{friendlyDate(recordDateFilter)} ×</button>}{recordCategoryFilter && <button className="active" onClick={() => setRecordCategoryFilter(null)}>{recordCategoryFilter.name} ×</button>}{([['all', '全部'], ['expense', '支出'], ['income', '收入']] as const).map(([value, label]) => <button className={recordFilter === value ? 'active' : ''} key={value} onClick={() => setRecordFilter(value)}>{label}</button>)}<span>{visibleRecords.length} 笔</span></div>
              {data.accounts.length > 0 && <label className="account-filter"><WalletCards size={16} /><select value={recordAccountFilter} onChange={(event) => setRecordAccountFilter(event.target.value)}><option value="all">全部账户</option><option value="">未指定账户</option>{data.accounts.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><ChevronRight size={15} /></label>}
              <div className="records-total"><span>筛选合计</span><b>支出 {formatMoney(visibleRecords.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0))}</b></div>
              {recordGroups.length ? <div className="record-groups">{recordGroups.map((group) => <section className="record-group" key={group.date}><div className="record-group-title"><b>{friendlyDate(group.date)}</b><span>{group.transactions.length} 笔</span></div><div className="transaction-list records-list">{group.transactions.map(renderTransaction)}</div></section>)}</div> : <section className="transaction-list records-list">{emptyState('没有匹配的记录')}</section>}
            </div>
          )}

          {tab === 'profile' && (
            <div className="page profile-page">
              <header className="page-header profile-title"><div><p className="eyebrow">MY LEDGER</p><h1>我的</h1></div><span className="profile-brand-mark"><img src="/app-icon.png" alt="拾账账户版图标" /></span></header>
              <button className="profile-hero" onClick={() => openSettings('profile')}><span className="profile-avatar-large">{data.avatarImage ? <img src={data.avatarImage} alt="我的头像" /> : data.avatar || '我'}</span><span className="profile-copy"><b>{data.owner || '我的账本'}</b><small>本机账本 · {data.transactions.length} 笔记录</small></span><ChevronRight size={19} /></button>
              <section className="profile-overview"><div><b>{data.accounts.length}</b><span>账户</span></div><div><b>{formatMoney(creditOutstanding, 0)}</b><span>信用待还</span></div><div><b>{formatMoney(pendingReimbursement, 0)}</b><span>待报销</span></div></section>
              <div className="settings-group"><p>账本设置</p><div className="menu-list">
                <button onClick={() => switchTab('accounts')}><span className="menu-icon"><WalletCards /></span><span><b>账户与还款</b><small>{data.accounts.length ? `${data.accounts.length} 个账户` : '添加第一个账户'}</small></span><ChevronRight /></button>
                <button onClick={() => openSettings('budget')}><span className="menu-icon"><WalletCards /></span><span><b>预算设置</b><small>{data.budget ? `每月 ${formatMoney(data.budget, 0)}` : '还未设置'}</small></span><ChevronRight /></button>
                <button onClick={() => openSettings('categories')}><span className="menu-icon"><Tags /></span><span><b>分类管理</b><small>{enabledExpense.length + enabledIncome.length} 个分类已启用</small></span><ChevronRight /></button>
                <button onClick={() => openSettings('theme')}><span className="menu-icon"><Palette /></span><span><b>主题与外观</b><small>{activeThemeName}</small></span><i className="theme-dot" style={{ background: accent }} /><ChevronRight /></button>
              </div></div>
              <div className="settings-group"><p>其他</p><div className="menu-list"><button onClick={() => openSettings('settings')}><span className="menu-icon"><Settings2 /></span><span><b>设置</b><small>数据安全与账本信息</small></span><ChevronRight /></button><button onClick={() => openSettings('about')}><span className="menu-icon"><Info /></span><span><b>关于拾账</b><small>本机存储 · 简单安心</small></span><ChevronRight /></button></div></div>
              <p className="local-note"><ShieldCheck size={14} />数据只保存在你的设备中，不上传云端</p>
            </div>
          )}
        </div>

        <nav className="tabbar" aria-label="主要导航">
          <button className={tab === 'home' ? 'active' : ''} onClick={() => switchTab('home')}><Home /><span>首页</span></button>
          <button className={tab === 'accounts' ? 'active' : ''} onClick={() => switchTab('accounts')}><WalletCards /><span>账户</span></button>
          <button className="add-button" onClick={() => openNew()} aria-label="记一笔"><Plus /></button>
          <button className={tab === 'stats' ? 'active' : ''} onClick={() => switchTab('stats')}><BarChart3 /><span>统计</span></button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => switchTab('profile')}><CircleUserRound /><span>我的</span></button>
        </nav>

        {entryOpen && (
          <section className="entry-screen" role="dialog" aria-modal="true" aria-label={editingId ? '编辑记录' : '记一笔'}>
            <header className="entry-header"><span className="entry-spacer" /><div className="entry-tabs"><button className={draftType === 'expense' ? 'active' : ''} onClick={() => switchDraftType('expense')}>支出</button><button className={draftType === 'income' ? 'active' : ''} onClick={() => switchDraftType('income')}>收入</button></div><button className="entry-cancel" onClick={dismissEntry}>取消</button></header>
            <div className="entry-categories">{(draftType === 'expense' ? enabledExpense : enabledIncome).map((item) => { const Icon = item.icon; return <button key={item.name} className={category === item.name ? 'active' : ''} onClick={() => setCategory(item.name)}><span style={category === item.name ? { background: 'var(--accent)', color: 'var(--accent-text)' } : undefined}><Icon size={24} strokeWidth={1.8} /></span><b>{item.name}</b></button>; })}</div>
            <div className="entry-summary">
              <div className="entry-number"><small>{baseAmount !== null && operator ? `${formatMoney(baseAmount)} ${operator} ${amount || '0'}` : draftType === 'expense' ? '支出金额' : '收入金额'}</small><strong>¥ {baseAmount !== null && operator ? evaluatedAmount.toFixed(2) : amount || '0'}</strong></div>
              <div className="entry-fields"><label className="entry-account"><WalletCards size={16} /><select value={selectedAccountId} onChange={(event) => { setSelectedAccountId(event.target.value); if (data.accounts.find((item) => item.id === event.target.value)?.type !== 'credit') setInstallmentEnabled(false); }} aria-label="付款账户"><option value="">未指定账户</option>{data.accounts.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><ChevronRight size={14} /></label><label className="note-field"><Pencil size={16} /><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="备注（可选）" /></label></div>
              {draftType === 'expense' && <div className="entry-options"><button className={reimbursementStatus !== 'none' ? 'active' : ''} onClick={() => setReimbursementStatus(reimbursementStatus === 'none' ? 'pending' : reimbursementStatus === 'pending' ? 'reimbursed' : 'none')}><BriefcaseBusiness size={14} />{reimbursementStatus === 'pending' ? '待报销' : reimbursementStatus === 'reimbursed' ? '已报销 ✓' : '标记报销'}</button>{entryAccount?.type === 'credit' && <button className={installmentEnabled ? 'active' : ''} onClick={() => setInstallmentEnabled((value) => !value)}><CalendarClock size={14} />{installmentEnabled ? '分期 ✓' : '信用卡分期'}</button>}</div>}
              {installmentEnabled && entryAccount?.type === 'credit' && <div className="installment-editor"><label><span>期数</span><select value={installmentPeriods} onChange={(event) => setInstallmentPeriods(Number(event.target.value))}>{[3, 6, 12, 24].map((value) => <option value={value} key={value}>{value} 期</option>)}</select></label><label><span>总手续费</span><input inputMode="decimal" value={installmentFee} onChange={(event) => setInstallmentFee(event.target.value)} placeholder="0" /></label><small>消费只记一次，还款不会重复算支出</small></div>}
            </div>
            <div className="calculator" aria-label="金额键盘">
              {['7', '8', '9'].map((key) => <button key={key} onClick={() => pressKey(key)}>{key}</button>)}
              <label className="date-key"><CalendarDays size={20} /><span>{txDate === relativeDate(0) ? '今天' : `${Number(txDate.slice(5, 7))}/${Number(txDate.slice(8, 10))}`}</span><input type="date" value={txDate} onChange={(event) => setTxDate(event.target.value)} /></label>
              {['4', '5', '6'].map((key) => <button key={key} onClick={() => pressKey(key)}>{key}</button>)}<button className={operator === '+' ? 'active-op' : ''} onClick={() => pressOperator('+')}><Plus size={23} /></button>
              {['1', '2', '3'].map((key) => <button key={key} onClick={() => pressKey(key)}>{key}</button>)}<button className={operator === '-' ? 'active-op' : ''} onClick={() => pressOperator('-')}><Minus size={23} /></button>
              <button onClick={() => pressKey('.')}>.</button><button onClick={() => pressKey('0')}>0</button><button onClick={() => pressKey('backspace')} aria-label="退格">⌫</button><button className="finish-key" disabled={evaluatedAmount <= 0 || Boolean(operator && !amount)} onClick={saveTransaction}>完成</button>
            </div>
            {editingId && <button className="entry-delete" onClick={deleteTransaction}><Trash2 size={16} />删除这笔记录</button>}
          </section>
        )}

        {settingsPanel && (
          <div className="settings-layer" role="dialog" aria-modal="true" aria-label="拾账账户版设置">
            <button className="settings-backdrop" onClick={dismissSettings} aria-label="关闭设置" />
            <section className="settings-sheet"><div className="sheet-handle" /><header><div><p className="eyebrow">SETTINGS</p><h2>{settingsPanel === 'profile' ? '个人资料' : settingsPanel === 'theme' ? '主题与外观' : settingsPanel === 'budget' ? '预算设置' : settingsPanel === 'categories' ? '分类管理' : settingsPanel === 'settings' ? '设置' : settingsPanel === 'account' ? '添加账户' : settingsPanel === 'bill' ? '添加固定账单' : settingsPanel === 'repayment' ? '记录还款' : '关于拾账账户版'}</h2></div><button onClick={dismissSettings} aria-label="关闭"><X size={20} /></button></header>
              {settingsPanel === 'profile' && <div className="sheet-content"><div className="avatar-picker"><span>{data.avatarImage ? <img src={data.avatarImage} alt="我的头像" /> : data.avatar || '我'}</span><div className="avatar-options"><label className="avatar-upload"><ImagePlus size={17} /><b>{data.avatarImage ? '更换照片' : '上传照片'}</b><input type="file" accept="image/*" onChange={handleAvatarUpload} /></label></div></div><label className="form-field"><span><UserRound size={17} />账本昵称</span><input maxLength={12} value={data.owner} onChange={(event) => setData((current) => ({ ...current, owner: event.target.value }))} placeholder="输入你的昵称" /></label><label className="form-field"><span><Pencil size={17} />简约文字头像</span><input maxLength={2} value={data.avatar} onChange={(event) => setData((current) => ({ ...current, avatar: event.target.value, avatarImage: '' }))} placeholder="1—2 个字或符号" /></label></div>}
              {settingsPanel === 'theme' && <div className="sheet-content"><p className="sheet-tip">选择一种喜欢的主色，界面会立即更新。</p><div className="theme-list">{themeOptions.map((item) => <button className={data.theme === item.id ? 'active' : ''} key={item.id} onClick={() => setData((current) => ({ ...current, theme: item.id }))}><i style={{ background: item.accent }} /><span>{item.name}</span>{data.theme === item.id && <Check size={18} />}</button>)}<label className={data.theme === 'custom' ? 'active custom-color' : 'custom-color'} onClick={() => setData((current) => ({ ...current, theme: 'custom' }))}><i style={{ background: data.customAccent }}><Palette size={15} /></i><span>自定义颜色</span>{data.theme === 'custom' && <Check size={18} />}<input type="color" value={data.customAccent} onChange={(event) => setData((current) => ({ ...current, theme: 'custom', customAccent: event.target.value }))} /></label></div></div>}
              {settingsPanel === 'budget' && <div className="sheet-content"><p className="sheet-tip">预算从 0 开始，你可以随时修改；设为 0 即关闭提醒。</p><label className="budget-editor"><span>¥</span><input autoFocus inputMode="decimal" value={data.budget || ''} onChange={(event) => setData((current) => ({ ...current, budget: Math.max(0, Number(event.target.value)) }))} placeholder="0" /></label><div className="budget-presets">{[1000, 3000, 5000, 8000].map((value) => <button key={value} onClick={() => setData((current) => ({ ...current, budget: value }))}>{formatMoney(value, 0)}</button>)}</div></div>}
              {settingsPanel === 'categories' && <div className="sheet-content category-settings"><p className="sheet-tip">关闭不常用的分类，记账页会更精简。你也可以添加自己的支出或收入分类，已有账目不会受影响。</p>{([['expense', '支出分类', expenseCategoryOptions], ['income', '收入分类', incomeCategoryOptions]] as const).map(([type, label, items]) => <div className="category-setting-group" key={type}><h3>{label}</h3><div className="category-setting-list">{items.map((item) => { const Icon = item.icon; const enabled = !data.hiddenCategories.includes(`${type}:${item.name}`); return <div className={`category-setting-item ${enabled ? 'enabled' : ''}`} key={`${type}:${item.name}`}><button className="category-toggle" onClick={() => toggleCategory(type, item.name)}><span style={{ background: item.soft, color: item.color }}><Icon size={18} /></span><b>{item.name}</b><i>{enabled ? '显示' : '隐藏'}</i></button>{item.customId && <button className="category-remove" onClick={() => deleteCustomCategory(item, type)} aria-label={`删除${item.name}`}><Trash2 size={14} /></button>}</div>; })}</div><form className="category-add" onSubmit={(event) => addCustomCategory(event, type)}><input maxLength={8} value={newCategoryNames[type]} onChange={(event) => setNewCategoryNames((current) => ({ ...current, [type]: event.target.value }))} placeholder={type === 'expense' ? '例如：宠物、订阅' : '例如：副业、利息'} /><button type="submit"><Plus size={16} />添加</button></form></div>)}</div>}
              {settingsPanel === 'account' && <form className="sheet-content account-form" onSubmit={saveAccount}><p className="sheet-tip">普通账户可以只作为付款方式；信用账户会计算待还金额、可用额度和还款日。</p><div className="choice-grid">{([['payment', '微信/支付宝', WalletCards], ['bank', '银行卡', Landmark], ['cash', '现金', Banknote], ['credit', '信用卡', CreditCard]] as const).map(([value, label, Icon]) => <button type="button" className={accountDraft.type === value ? 'active' : ''} key={value} onClick={() => setAccountDraft((current) => ({ ...current, type: value, trackBalance: value === 'bank' || value === 'cash' || value === 'credit' }))}><Icon size={18} /><span>{label}</span></button>)}</div><label className="form-field"><span><WalletCards size={17} />账户名称</span><input autoFocus maxLength={12} value={accountDraft.name} onChange={(event) => setAccountDraft((current) => ({ ...current, name: event.target.value }))} placeholder={accountDraft.type === 'credit' ? '例如：招商信用卡' : '例如：微信钱包'} /></label><label className="form-field"><span><Info size={17} />尾号（可选）</span><input inputMode="numeric" maxLength={4} value={accountDraft.last4} onChange={(event) => setAccountDraft((current) => ({ ...current, last4: event.target.value.replace(/\D/g, '') }))} placeholder="银行卡后 4 位" /></label>{accountDraft.type !== 'credit' && <label className="switch-row"><span><b>跟踪实际余额</b><small>关闭后只记录付款方式</small></span><input type="checkbox" checked={accountDraft.trackBalance} onChange={(event) => setAccountDraft((current) => ({ ...current, trackBalance: event.target.checked }))} /></label>}{(accountDraft.trackBalance || accountDraft.type === 'credit') && <label className="form-field"><span><CircleDollarSign size={17} />{accountDraft.type === 'credit' ? '当前已欠金额' : '当前余额'}</span><input inputMode="decimal" value={accountDraft.openingBalance} onChange={(event) => setAccountDraft((current) => ({ ...current, openingBalance: event.target.value }))} placeholder="0" /></label>}{accountDraft.type === 'credit' && <><label className="form-field"><span><CreditCard size={17} />信用额度</span><input inputMode="decimal" value={accountDraft.creditLimit} onChange={(event) => setAccountDraft((current) => ({ ...current, creditLimit: event.target.value }))} placeholder="例如：30000" /></label><div className="dual-fields"><label><span>账单日</span><input inputMode="numeric" value={accountDraft.statementDay} onChange={(event) => setAccountDraft((current) => ({ ...current, statementDay: event.target.value }))} /></label><label><span>还款日</span><input inputMode="numeric" value={accountDraft.dueDay} onChange={(event) => setAccountDraft((current) => ({ ...current, dueDay: event.target.value }))} /></label></div></>}<button className="primary-form-action" type="submit">保存账户</button></form>}
              {settingsPanel === 'bill' && <form className="sheet-content account-form" onSubmit={saveBill}><p className="sheet-tip">固定账单不会直接生成支出，只会在到期前提醒你；付款后再记一笔即可。</p><label className="form-field"><span><Repeat2 size={17} />账单名称</span><input autoFocus maxLength={16} value={billDraft.title} onChange={(event) => setBillDraft((current) => ({ ...current, title: event.target.value }))} placeholder="例如：房租、视频会员" /></label><label className="form-field"><span><CircleDollarSign size={17} />每月金额</span><input inputMode="decimal" value={billDraft.amount} onChange={(event) => setBillDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" /></label><div className="dual-fields"><label><span>每月付款日</span><input inputMode="numeric" value={billDraft.dueDay} onChange={(event) => setBillDraft((current) => ({ ...current, dueDay: event.target.value }))} /></label><label><span>付款账户</span><select value={billDraft.accountId} onChange={(event) => setBillDraft((current) => ({ ...current, accountId: event.target.value }))}><option value="">未指定</option>{data.accounts.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div><button className="primary-form-action" type="submit">保存固定账单</button></form>}
              {settingsPanel === 'repayment' && <form className="sheet-content account-form" onSubmit={saveRepayment}><p className="sheet-tip">还信用卡属于账户之间的资金移动，不会再次计入消费支出。</p><label className="form-field"><span><CreditCard size={17} />偿还账户</span><select value={repaymentAccountId} onChange={(event) => setRepaymentAccountId(event.target.value)}>{data.accounts.filter((item) => item.type === 'credit').map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="form-field"><span><Landmark size={17} />付款来源</span><select value={repaymentFromId} onChange={(event) => setRepaymentFromId(event.target.value)}><option value="external">外部账户 / 不跟踪余额</option>{data.accounts.filter((item) => item.type !== 'credit').map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label className="form-field"><span><CircleDollarSign size={17} />还款金额</span><input autoFocus inputMode="decimal" value={repaymentAmount} onChange={(event) => setRepaymentAmount(event.target.value)} placeholder="0" /></label><label className="form-field"><span><CalendarDays size={17} />还款日期</span><input type="date" value={repaymentDate} onChange={(event) => setRepaymentDate(event.target.value)} /></label><button className="primary-form-action" type="submit">确认还款</button></form>}
              {settingsPanel === 'settings' && <div className="sheet-content"><p className="sheet-tip">账目数据只保存在当前设备。建议定期导出账单；清空后无法撤销。</p><div className="settings-group"><p>数据与安全</p><div className="menu-list"><button onClick={exportCsv}><span className="menu-icon"><Download /></span><span><b>导出账单</b><small>保存为 CSV 文件</small></span><ChevronRight /></button><button onClick={clearTransactions} className="danger-row"><span className="menu-icon"><Trash2 /></span><span><b>清空所有账目</b><small>保留账户、昵称、主题和设置</small></span><ChevronRight /></button></div></div><p className="local-note"><ShieldCheck size={14} />数据只保存在你的设备中，不上传云端</p></div>}
              {settingsPanel === 'about' && <div className="sheet-content about-card"><img src="/app-icon.png" alt="拾账图标" /><h3>拾账 · 账户版</h3><p>为职场人设计的轻量账户与还款管理工具。消费只记一次，还款只做转账，避免重复统计。</p><span><ShieldCheck size={17} />所有数据仅存于本机</span><small>账户版 0.2</small></div>}
            </section>
          </div>
        )}
        {toast && <div className="toast" role="status">{toast}</div>}
      </section>
    </main>
  );
}
