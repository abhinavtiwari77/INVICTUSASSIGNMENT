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

**How to reproduce:**
