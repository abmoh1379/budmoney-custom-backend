import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import {
  selectExpensesError,
  selectExpensesLoading,
} from "../../slices/expenses";
import { startFetchUserExpenses } from "../../actions/expenses";
import { selectAllFilteredExpenses } from "../../slices/expenses";
import LayoutContainer from "../UI/LayoutContainer";
import ExpenseExcerpt from "./ExpenseExcerpt";
import Loader from "../UI/Loader";
import RedBtn from './UI/RedBtn';

const ExpensesList = ({
  expenses,
  expensesLoading,
  expensesError,
  startFetchUserExpenses,
}) => {
  const expensesArray = useMemo(() => {
    return expenses.map((expense) => {
      return <ExpenseExcerpt key={expense.id} expense={expense} />;
    });
  }, [expenses]);
  let content;
  if (expensesLoading) {
    content = (
      <div className="app-expenses__loader-container">
        <Loader spinnerHeight="40" spinnerWidth="40" />
        <p className="app-expenses__loader-paragraph">Loading expenses...</p>
      </div>
    );
  } else if (expensesError) {
    content = (
      <div className="app-expenses__error-container">
        <p className="app-expenses__error-paragraph">{expensesError}</p>
        <RedBtn onClick={() => startFetchUserExpenses()}>Try again!</RedBtn>
      </div>
    );
  } else if (!expenses.length && !expensesError && !expensesLoading) {
    content = <p className="app-expenses__list-paragraph">No expenses yet.</p>;
  } else {
    content = <ul className="app-expenses__list">{expensesArray}</ul>;
  }

  useEffect(() => {
      startFetchUserExpenses();
  }, [startFetchUserExpenses])
  return (
    <section className="app-expenses">
      <LayoutContainer className="container--app-expenses-list">
        <header className="app-expenses__header">
          <p className="app-expenses__header-title">Expenses</p>
          <p className="app-expenses__header-title">Amount</p>
        </header>
        {content}
      </LayoutContainer>
    </section>
  );
};

const mapStateToProps = (state) => {
  return {
    expenses: selectAllFilteredExpenses(state),
    expensesLoading: selectExpensesLoading(state),
    expensesError: selectExpensesError(state),
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    startFetchUserExpenses: () => dispatch(startFetchUserExpenses()),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ExpensesList);
