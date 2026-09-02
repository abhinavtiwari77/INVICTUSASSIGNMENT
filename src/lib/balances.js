import { sharesForExpense } from "./money.js";

export function computeBalances(members, expenses) {
  const bal = {};
  for (const m of members) bal[m.id] = 0;

  for (const exp of expenses) {
    const shares = sharesForExpense(exp);
    // Credit the payer the full amount they spent out-of-pocket
    bal[exp.paidBy] = (bal[exp.paidBy] || 0) + Number(exp.amount);
    
    // Deduct the split portions from each participant
    for (const [id, share] of Object.entries(shares)) {
      bal[Number(id)] = (bal[Number(id)] || 0) - share;
    }
  }
  return bal;
}

export function totalSpent(expenses) {
  return expenses.reduce((s, e) => s + Number(e.amount), 0);
}