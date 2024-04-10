import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "../components/UI/Loader";
import PrivateRoute from "../components/routes/PrivateRoute";
import DashboardPage from "../pages/DashboardPage";
import AddExpensePage from "../pages/AddExpensePage";
import EditExpensePage from "../pages/EditExpensePage";
import Header from "../components/app/Header";
import PersistLogin from "../components/PersistLogin";

const LandingPageLazy = lazy(() => import("../pages/LandingPage"));
const LoginPageLazy = lazy(() => import("../pages/LoginPage"));
const SignUpLazy = lazy(() => import("../pages/SignUpPage"));
const NotFoundLazy = lazy(() => import("../pages/NotFoundPage"));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="loader-container">
          <Loader />
        </div>
      }
    >
      <Routes>
        <Route element = {<PersistLogin />}>
          {/* public routes*/}
          <Route index element={<LandingPageLazy />} />
          <Route path="login" element={<LoginPageLazy />} />
          <Route path="sign-up" element={<SignUpLazy />} />
          {/* protected routes*/}
          <Route element={<PrivateRoute />}>
            <Route element={<Header />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="expense/add" element={<AddExpensePage />} />
              <Route path="expense/edit/:id" element={<EditExpensePage />} />
            </Route>
          </Route>
          {/* catch no routes*/}
          <Route path="*" element={<NotFoundLazy />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
