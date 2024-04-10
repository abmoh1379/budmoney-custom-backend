import {
  createSlice,
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { selectAllFilters } from "./filters";
import expensesFilters from "../selector/expensesFilters";

import {
  startAddExpense,
  startEditExpense,
  startRemoveExpense,
  startFetchUserExpenses,
} from "../actions/expenses";

const expensesAdaptor = createEntityAdapter({});
const initialState = expensesAdaptor.getInitialState({
  loading: false,
  //   // loading and error are only for expensesList and dashboardPage. we use our own loading and error for other actions related to expenses.
  error: null,
});
const expenses = createSlice({
  name: "expenses",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(startAddExpense.pending, (state, action) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(startAddExpense.fulfilled, (state, { payload }) => {
        state.loading = false;
        if(payload) {
          if(payload.status === 'fulfilled') {
            expensesAdaptor.addOne(state, payload.newExpense);
          } else if(payload.status === 'rejected') {
            state.error = payload.errorMessage;
          } 
        }
      })
      .addCase(startAddExpense.rejected, (state, action) => {})
      .addCase(startEditExpense.pending, (state, action) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(startEditExpense.fulfilled, (state, { payload }) => {
        state.loading = false;
        if(payload) {
          if(payload.status === 'fulfilled') {
            expensesAdaptor.upsertOne(state, payload.expenseData);
          } else if(payload.status === 'rejected') {
            state.error = payload.errorMessage;
          } 
        }

      })
      .addCase(startEditExpense.rejected, (state, action) => {})
      .addCase(startRemoveExpense.pending, (state, action) => {
        state.error = null;
        state.loading = true;
      })
      .addCase(startRemoveExpense.fulfilled, (state, { payload }) => {
        state.loading = false;
        if(payload) {
          if(payload.status === 'fulfilled') {
            expensesAdaptor.removeOne(state, payload.expenseId);
          } else if(payload.status === 'rejected') {
            state.error = payload.errorMessage;
          }
        }
      })
      .addCase(startRemoveExpense.rejected, (state, action) => {})
      .addCase(startFetchUserExpenses.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startFetchUserExpenses.fulfilled, (state, { payload }) => {
        // if user simply log out and dont refresh the page, in login again, we should empty the array and fetch again, otherwise the expenses list will be duplicated
        expensesAdaptor.removeAll(state);
        if(payload) {
          if(payload.status === 'fulfilled') {
            if (payload.expenses.length) {
              expensesAdaptor.upsertMany(state, payload.expenses);
            }
          } else if(payload.status === 'rejected') {
            state.error = payload.errorMessage;
          }
        }
        state.loading = false;
      })
      .addCase(startFetchUserExpenses.rejected, (state, action) => {
      });
  },
});

export const {
  selectById: selectExpenseById,
  selectAll: selectAllExpenses,
  selectIds: selectExpensesIds,
  selectTotal : selectTotalExpenses,
  selectEntities : selectAllExpensesEntites

} = expensesAdaptor.getSelectors((state) => state.expenses);

// why we need this createSelector? because in the expensesList component, we are using expensesFilters selector function on expenses state
// as the result of this, everytime this expenses Object state changes, even though the expenses might not change, because we are using a
// filtering function that returns the filtered expenses everytime, we are re-rendering the full expenses array. to memoize this array
// and avoid this re-rendering while the expenses array really doesnt change at all, we use this createSelector to create a
// memozied inputs to this filtered function
export const selectAllFilteredExpenses = createSelector(
  [selectAllExpenses, selectAllFilters],
  (expensesInput, filters) => expensesFilters(expensesInput, filters)
);

export const selectExpensesLoading = (state) => state.expenses.loading;
export const selectExpensesError = (state) => state.expenses.error;

export const {setError, setLoading} = expenses.actions;
export default expenses.reducer;
