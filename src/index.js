import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import {disableReactDevTools} from '@fvilers/disable-react-devtools';
import store from "./store/store";
import App from "./App";
import ErrorBoundry from "./components/ErrorBoundry";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

// disabling react-dev-tools in production
if(process.env.NODE_ENV === 'production') {
  disableReactDevTools();
}

const jsx = (
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route element={<ErrorBoundry />}>
            <Route path="/*" element={<App />} />
          </Route>
        </Routes>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);


root.render(jsx);