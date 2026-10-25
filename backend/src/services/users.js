import bcrypt from "bcryptjs";
import { seed } from "../data/index.js";
import { insertUser, uid } from "../db.js";

const clone = (o) => JSON.parse(JSON.stringify(o));

export const defaultPrefs = () => ({
  language: "en",
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  simpleLanguage: false,
});

export function demoData() {
  return {
    income: clone(seed.income),
    expenses: clone(seed.expenses),
    goals: clone(seed.goals),
    debts: clone(seed.debts),
    recoveryGoals: clone(seed.recoveryGoals),
    budgetLimits: { Transport: 800, Food: 2000 },
  };
}

export async function createUser({ name, email, password, withDemoData = true }) {
  const user = {
    id: uid(),
    name,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
    onboarded: false,
    incomeType: null,
    goalsSelected: [],
    theme: "light",
    prefs: defaultPrefs(),
    irregularMode: false,
    lessonBest: {},
    scamQuizBest: null,
    ...(withDemoData ? demoData() : { income: [], expenses: [], goals: [], debts: [], recoveryGoals: [], budgetLimits: {} }),
  };
  return insertUser(user);
}

export const publicUser = ({ passwordHash, ...rest }) => ({
  id: rest.id,
  name: rest.name,
  email: rest.email,
  onboarded: rest.onboarded,
  incomeType: rest.incomeType,
  goalsSelected: rest.goalsSelected,
  theme: rest.theme,
  prefs: rest.prefs,
  irregularMode: rest.irregularMode,
  createdAt: rest.createdAt,
});
