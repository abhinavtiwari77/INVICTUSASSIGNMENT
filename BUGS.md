# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top.

**What I changed:**
Updated the array sorting routine inside `src/components/ExpenseList.jsx` to sort from highest timestamp value to lowest, forcing the newest entries to the top.
Rewrote the `dateValue` helper function in `src/lib/format.js` to explicitly handle both instances of JS `Date` objects and incoming ISO date strings from browser storage, extracting a standard Unix millisecond timestamp via `.getTime()` to safely prevent `NaN` errors.
---

## Bug 2

**How to reproduce:** Create or view an expense where the person who paid the bill is not included in the split (for example, Diya pays ₹60 for a cab ride that only Aisha and Ben took). Check the calculated running balances panel for Diya.

**What is wrong:** The app calculates incorrect balances when the bill payer is excluded from the split. An erroneous `if` block inside the loop incorrectly penalizes the payer by subtracting an equal split portion from their balance (`bal[exp.paidBy] -= Number(exp.amount) / n;`). This results in the payer being credited for less money than they actually spent out-of-pocket, causing money to disappear from the closed group total.

**What I changed:** 
Removed the incorrect `if (!(exp.paidBy in shares) ...)` conditional block from the `computeBalances` function inside `src/lib/balances.js`.
Simplified the function to consistently credit the paying user for the total absolute transaction value, and then loop through the individual shares to subtract liabilities from participants properly.


## Bug 3
**How to reproduce:** Open the app and look at the running balances panel on the right side. Compare what each person spent versus what the label says they owe or are owed.

**What is wrong:** The display text labels are completely backward. When a person has a positive balance (meaning they paid more than their fair share and the group owes them money), the UI says they "owe". When they have a negative balance (meaning they consumed more than they paid for and they owe the group), the UI says they are "is owed". 

**What I changed:** 
Opened `src/components/BalancesPanel.jsx` and updated the conditional branch block.
Swapped the labels and CSS classes so that a positive balance (`bal > 0.005`) correctly displays `is owed` with the `"owed"` styling class, and a negative balance (`bal < -0.005`) correctly displays `owes` with the `"owe"` styling class.


## Bug 4
**How to reproduce:** Create or adjust balances so that a debtor owes the exact same amount that a creditor is owed (e.g., Aisha owes ₹50 and Ben is owed ₹50). Look at the suggested settlement transfers list.

**What is wrong:** The app fails to suggest a transaction when debtor and creditor balances match exactly. In `src/lib/settle.js`, the final `else` block increments both array pointers (`i += 1` and `j += 1`) without running `transfers.push()`. This causes matching debts to clear from the calculation tracking loop without actually printing the transfer instructions on the screen.

**What I changed:**
* Updated the `else` branch inside the settlement loop in `src/lib/settle.js`.
* Added logic to push a valid payment object containing the sender, recipient, names, and exact matching amount into the `transfers` array before shifting the pointers forward.
