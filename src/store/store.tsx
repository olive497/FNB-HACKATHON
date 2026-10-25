import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  DEMO_USER,
  seedDebts,
  seedExpenses,
  seedGoals,
  seedIncome,
  seedRecoveryGoals,
  type Contact,
  type Debt,
  type Expense,
  type Goal,
  type Income,
} from "@/lib/demo-data";
import { uid } from "@/lib/format";

export type Theme = "light" | "dark";
export type Prefs = {
  language: "en" | "zu";
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  simpleLanguage: boolean;
};
type User = { name: string; email?: string } | null;

type Persisted = {
  theme: Theme;
  authed: boolean;
  onboarded: boolean;
  incomeType: string;
  financialGoals: string[];
  user: User;
  prefs: Prefs;
  income: Income[];
  expenses: Expense[];
  goals: Goal[];
  debts: Debt[];
  recoveryGoals: Goal[];
};

const STORAGE_KEY = "safebank-demo-v1";

const defaults: Persisted = {
  theme: "light",
  authed: false,
  onboarded: false,
  incomeType: "",
  financialGoals: [],
  user: null,
  prefs: {
    language: "en",
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    simpleLanguage: false,
  },
  income: seedIncome,
  expenses: seedExpenses,
  goals: seedGoals,
  debts: seedDebts,
  recoveryGoals: seedRecoveryGoals,
};

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed, prefs: { ...defaults.prefs, ...(parsed.prefs ?? {}) } };
  } catch {
    return defaults;
  }
}

// Sensitive planning data lives ONLY in memory — never persisted to storage.
type SafetyState = { safeExit: Record<string, number | null>; circle: Contact[] };
const emptySafety: SafetyState = { safeExit: {}, circle: [] };

type Store = Persisted & {
  loaded: boolean;
  safeExit: Record<string, number | null>;
  circle: Contact[];
  loginDemo: () => void;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  completeOnboarding: (incomeType: string, goals: string[], prefs: Partial<Prefs>) => void;
  setTheme: (t: Theme) => void;
  updatePrefs: (p: Partial<Prefs>) => void;
  updateUser: (u: Partial<NonNullable<User>>) => void;
  addIncome: (i: Omit<Income, "id">) => void;
  updateIncome: (id: string, patch: Partial<Income>) => void;
  removeIncome: (id: string) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  addDebt: (d: Omit<Debt, "id">) => void;
  removeDebt: (id: string) => void;
  addRecoveryGoal: (g: Omit<Goal, "id">) => void;
  updateRecoveryGoal: (id: string, patch: Partial<Goal>) => void;
  removeRecoveryGoal: (id: string) => void;
  setSafeExitItem: (key: string, value: number | null) => void;
  clearSafeExit: () => void;
  addContact: (name: string, relation: string) => void;
  removeContact: (id: string) => void;
  clearSensitiveData: () => void;
  resetDemoData: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function SafeBankProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [safety, setSafety] = useState<SafetyState>(emptySafety);

  useEffect(() => {
    setState(loadPersisted());
    setLoaded(true);
  }, []);

  // Persist non-sensitive demo data only.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — demo continues in memory */
    }
  }, [state, loaded]);

  // Apply theme + accessibility preferences to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
    root.classList.toggle("large-text", state.prefs.largeText);
    root.classList.toggle("high-contrast", state.prefs.highContrast);
    root.classList.toggle("reduced-motion", state.prefs.reducedMotion);
  }, [state.theme, state.prefs]);

  const patch = useCallback((p: Partial<Persisted>) => setState((s) => ({ ...s, ...p })), []);

  const store: Store = useMemo(() => {
    const toastMsg = (m: string) => toast.success(m);
    return {
      ...state,
      loaded,
      safeExit: safety.safeExit,
      circle: safety.circle,
      loginDemo: () => {
        patch({ authed: true, onboarded: false, user: DEMO_USER });
        toastMsg("Demo account ready — welcome, Thando!");
      },
      login: (email: string) => {
        patch({ authed: true, onboarded: false, user: { name: DEMO_USER.name, email } });
        toastMsg("Signed in to the SafeBank demo.");
      },
      signup: (name: string, email: string) => {
        patch({ authed: true, onboarded: false, user: { name, email } });
        toastMsg(`Welcome to SafeBank, ${name.split(" ")[0]}!`);
      },
      logout: () => {
        patch({ authed: false, onboarded: false, user: null });
        setSafety(emptySafety);
      },
      completeOnboarding: (incomeType, goalsSelected, p) => {
        patch({
          onboarded: true,
          prefs: { ...state.prefs, ...p },
        });
        toastMsg("Welcome to SafeBank. Your dashboard is ready.");
        void incomeType;
        void goalsSelected;
      },
      setTheme: (t) => patch({ theme: t }),
      updatePrefs: (p) => patch({ prefs: { ...state.prefs, ...p } }),
      updateUser: (u) =>
        patch({ user: state.user ? { ...state.user, ...u } : state.user }),
      addIncome: (i) => {
        setState((s) => ({ ...s, income: [...s.income, { ...i, id: uid() }] }));
        toastMsg("Income added.");
      },
      updateIncome: (id, p) =>
        setState((s) => ({
          ...s,
          income: s.income.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      removeIncome: (id) => {
        setState((s) => ({ ...s, income: s.income.filter((x) => x.id !== id) }));
        toastMsg("Income entry deleted.");
      },
      addExpense: (e) => {
        setState((s) => ({ ...s, expenses: [...s.expenses, { ...e, id: uid() }] }));
        toastMsg("Expense added.");
      },
      updateExpense: (id, p) =>
        setState((s) => ({
          ...s,
          expenses: s.expenses.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      removeExpense: (id) => {
        setState((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== id) }));
        toastMsg("Expense deleted.");
      },
      addGoal: (g) => {
        setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid() }] }));
        toastMsg("Savings goal created.");
      },
      updateGoal: (id, p) =>
        setState((s) => ({ ...s, goals: s.goals.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      removeGoal: (id) => {
        setState((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== id) }));
        toastMsg("Goal deleted.");
      },
      addDebt: (d) => {
        setState((s) => ({ ...s, debts: [...s.debts, { ...d, id: uid() }] }));
        toastMsg("Debt added to your plan.");
      },
      removeDebt: (id) => {
        setState((s) => ({ ...s, debts: s.debts.filter((x) => x.id !== id) }));
        toastMsg("Debt removed from your plan.");
      },
      addRecoveryGoal: (g) => {
        setState((s) => ({ ...s, recoveryGoals: [...s.recoveryGoals, { ...g, id: uid() }] }));
        toastMsg("Recovery goal created.");
      },
      updateRecoveryGoal: (id, p) =>
        setState((s) => ({
          ...s,
          recoveryGoals: s.recoveryGoals.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      removeRecoveryGoal: (id) => {
        setState((s) => ({ ...s, recoveryGoals: s.recoveryGoals.filter((x) => x.id !== id) }));
        toastMsg("Recovery goal removed.");
      },
      setSafeExitItem: (key, value) =>
        setSafety((s) => ({ ...s, safeExit: { ...s.safeExit, [key]: value } })),
      clearSafeExit: () => setSafety((s) => ({ ...s, safeExit: {} })),
      addContact: (name, relation) => {
        setSafety((s) => ({ ...s, circle: [...s.circle, { id: uid(), name, relation }] }));
        toastMsg("Sample contact added (not contacted or shared).");
      },
      removeContact: (id) =>
        setSafety((s) => ({ ...s, circle: s.circle.filter((c) => c.id !== id) })),
      clearSensitiveData: () => {
        setSafety(emptySafety);
        toastMsg("Sensitive planning data cleared from this device session.");
      },
      resetDemoData: () => {
        setState({ ...defaults, authed: state.authed, onboarded: state.onboarded, user: state.user, theme: state.theme, prefs: state.prefs });
        setSafety(emptySafety);
        toastMsg("Demo data reset to the original sample budget.");
      },
    };
  }, [state, loaded, patch, safety]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useSafeBank(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useSafeBank must be used inside SafeBankProvider");
  return ctx;
}
