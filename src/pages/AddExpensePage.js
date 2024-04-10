import React, { useMemo } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startAddExpense } from "../actions/expenses";
import { selectExpensesError, selectExpensesLoading } from "../slices/expenses";
import LayoutContainer from "../components/UI/LayoutContainer";
import ExpenseForm from "../components/app/ExpenseForm";
import MainElement from "../components/UI/MainElement";
import AppNavigation from "../components/app/AppNavigation";

const AddExpensePage = ({
  startAddExpense,
  expensesLoading,
  expensesError,
}) => {
  const navigate = useNavigate();
  const onExpenseFormSubmit = async (expenseData) => {
    // we use prevState function to avoid unwanted results due to batching
    try {
      const payload = await startAddExpense(expenseData).unwrap();
      if(payload.status === 'fulfilled') {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (e) {

    } finally {
    }
  };

  return (
    <MainElement>
      <AppNavigation
        navTitle="Add Expense"
        linksArray={useMemo(() => {
          return [
            {
              to: "/dashboard",
              text: "Expenses List",
            },
          ];
        }, [])}
      />
      <section className="app-expense-add">
        <LayoutContainer className="container--app-add-expense">
          {/* we pass expense = {} to expenseForm for not failing in destructuring on props destructuring*/}
          <ExpenseForm
            onExpenseFormSubmit={onExpenseFormSubmit}
            expensesLoading = {expensesLoading}
            expensesError = {expensesError}
          />
        </LayoutContainer>
      </section>
    </MainElement>
  );
};

const mapStateToProps = (state, props) => {
  return {
    expensesLoading: selectExpensesLoading(state),
    expensesError: selectExpensesError(state),
  };
};
const mapDispatchToProps = (dispatch, props) => {
  return {
    startAddExpense: (expense) => dispatch(startAddExpense(expense))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddExpensePage);
