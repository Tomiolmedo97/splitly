import { type Allocation, type Cents, type MemberId, compareIds } from "./money";

export interface Expense {
  paidBy: MemberId;
  amountCents: Cents;
  splits: Allocation[];
}

export type Balances = Record<MemberId, Cents>;

/** Net balance per member: positive = is owed money, negative = owes. Sums to 0. */
export function computeBalances(expenses: Expense[]): Balances {
  const balances: Balances = {};
  for (const e of expenses) {
    const splitSum = e.splits.reduce((acc, s) => acc + s.amountCents, 0);
    if (splitSum !== e.amountCents) {
      throw new Error(`expense splits sum to ${splitSum}, expected ${e.amountCents}`);
    }
    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amountCents;
    for (const s of e.splits) {
      balances[s.memberId] = (balances[s.memberId] ?? 0) - s.amountCents;
    }
  }
  return balances;
}

export interface Transfer {
  from: MemberId;
  to: MemberId;
  amountCents: Cents;
}

/** Greedy: repeatedly match the largest debtor with the largest creditor. */
export function simplifyDebts(balances: Balances): Transfer[] {
  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  if (total !== 0) throw new Error(`balances must sum to 0 (got ${total})`);
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, v }));
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, v: -v }));
  const byAmount = (a: { id: string; v: number }, b: { id: string; v: number }) =>
    b.v - a.v || compareIds(a.id, b.id);
  const transfers: Transfer[] = [];
  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort(byAmount);
    debtors.sort(byAmount);
    const c = creditors[0]!;
    const d = debtors[0]!;
    const amount = Math.min(c.v, d.v);
    transfers.push({ from: d.id, to: c.id, amountCents: amount });
    c.v -= amount;
    d.v -= amount;
    if (c.v === 0) creditors.shift();
    if (d.v === 0) debtors.shift();
  }
  return transfers;
}
