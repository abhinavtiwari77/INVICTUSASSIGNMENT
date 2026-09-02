# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top.

**What I changed:**
Updated the array sorting routine inside `src/components/ExpenseList.jsx` to sort from highest timestamp value to lowest, forcing the newest entries to the top.
* Rewrote the `dateValue` helper function in `src/lib/format.js` to explicitly handle both instances of JS `Date` objects and incoming ISO date strings from browser storage, extracting a standard Unix millisecond timestamp via `.getTime()` to safely prevent `NaN` errors.
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


## Bug 5
**How to reproduce:** Log an expense with an amount that cannot be cleanly divided (e.g., ₹100 split equally among 3 people, or a ₹20 bill split using custom percentages like 33.33%, 33.33%, and 33.34%). Check the total sum of the split portions.

**What is wrong:** The app loses or invents pennies/paise due to standard floating-point rounding errors. Splitting ₹100 three ways results in ₹33.33 each, losing ₹0.01 from the total (₹99.99). Conversely, percentage splits like 33.33% of ₹20 can invent money (totaling ₹20.01). This directly violates the rule that portions must perfectly match the original bill total without losing or creating money.

**What I changed:** 
* Rewrote `splitEqual` in `src/lib/money.js` to track the running distributed total (`assigned`). It assigns the standard split value to everyone except the very last person, who receives the exact remaining balance (`amount - assigned`), absorbing any fractional remainder.
* Rewrote `splitByPercent` in `src/lib/money.js` using a similar approach. The last person in the entries array automatically receives the remaining absolute balance to guarantee that the sum of the individual shares adds up precisely to the total bill amount.


## Bug 6
**How to reproduce:** Choose a specific group member from the "Paid by" dropdown select input in the Filter card panel. Check the expense items list.

**What is wrong:** The app displays "No expenses match these filters" even when expenses matching that person exist. This happens due to a data-type mismatch in `src/App.jsx`. The HTML `<select>` element captures the user selection choice value as a string type (e.g., `"4"`), whereas the database seed array tracks the `e.paidBy` attribute as a number type (e.g., `4`). Doing a strict inequality evaluation (`e.paidBy !== paidBy`) evaluates to true for every item and incorrectly filters out valid entries.

**What I changed:**
* Opened `src/App.jsx` and updated the filtering conditional statement block.
* Wrapped both parts of the comparison statement in standard type constructor methods (`String(e.paidBy) !== String(paidBy)`) to safely neutralize type inequality bugs.

## Bug 7
**How to reproduce:** Use the search filter or category filters to narrow down the expense list. Try to delete or edit/update an expense while the filter is active. 

**What is wrong:** The application deletes or updates the wrong expense when a filter is active. The application passes a filtered index from `ExpenseList.jsx` back to `App.jsx`, which then uses that index directly against the unfiltered, original `state.expenses` array. This results in data corruption as actions are performed on mismatched items. Additionally, using `key={index}` instead of a unique ID in the React `.map()` loop causes rendering updates to break.

**What I changed:**
* Refactored the delete and update handlers in `src/App.jsx` and `src/components/ExpenseList.jsx` to pass the unique `expense.id` or the whole `expense` object instead of an array index.
* Updated the reducer action handlers (`DELETE_EXPENSE` and `UPDATE_EXPENSE`) in `src/store/store.js` (or your store file) to look up and modify elements by matching their unique IDs (`e.id !== action.id`) using `.filter()` and `.map()`.
* Changed the list rendering React key assignment from `key={index}` to a stable `key={expense.id}` within the expense map statement.


## Bug 8
**How to reproduce:** Add a few expenses to the app, refresh the browser window, and look closely at the list layout. Try to sort the items or check if the formatting fails.

**What is wrong:** The app fails to convert dates back into native JavaScript Date objects when reading data from browser memory. While `loadState` runs a helper called `hydrate()` on the initial sample data, it completely bypasses it when pulling saved data out of `localStorage`. Because `JSON.parse()` leaves all transaction dates as plain text strings, it breaks any component math that relies on date structures.

**What I changed:**
* Opened `src/state/store.js` and modified the `loadState` function block.
* Updated the retrieval sequence so that data read from `localStorage` is explicitly wrapped inside the `hydrate()` utility function (`return hydrate(JSON.parse(raw));`) before being handed off to the React application state.


## Bug 9
**How to reproduce:** Fill out the form fields under the "Add expense" section with a description, amount, and category. Click the "Save expense" button. Observe the form state after submission.

**What is wrong:** The "Add expense" form fails to reset its input values after a successful submission. The local component state strings, numbers, and split tracking options remain frozen with the previous transaction's data. This forces users to manually delete, clear, and override fields text character-by-character just to add a subsequent expense item.

**What I changed:**
* Opened `src/components/AddExpenseForm.jsx` and located the submission callback block.
* Appended explicit state setter hooks (`setDescription("")`, `setAmount("")`, etc.) immediately following the `onAdd()` execution line to automatically wipe the active inputs and restore clean initial state options.
