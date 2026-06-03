import React from 'react';
import ReactDOM from 'react-dom/client';

// Transparently intercept localStorage for authentication keys
// to respect the "Remember Me" setting (using sessionStorage if not selected)
const originalGetItem = localStorage.getItem;
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;

localStorage.getItem = function (key) {
  if (["isLoggedIn", "token", "user"].includes(key)) {
    return originalGetItem.call(localStorage, key) || sessionStorage.getItem(key);
  }
  return originalGetItem.apply(this, arguments);
};

localStorage.setItem = function (key, value) {
  if (["isLoggedIn", "token", "user"].includes(key)) {
    const remember = originalGetItem.call(localStorage, "remember") === "true";
    if (remember) {
      originalSetItem.call(localStorage, key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      originalRemoveItem.call(localStorage, key);
    }
    return;
  }
  return originalSetItem.apply(this, arguments);
};

localStorage.removeItem = function (key) {
  if (["isLoggedIn", "token", "user"].includes(key)) {
    originalRemoveItem.call(localStorage, key);
    sessionStorage.removeItem(key);
    originalRemoveItem.call(localStorage, "remember");
    return;
  }
  return originalRemoveItem.apply(this, arguments);
};

import { Provider } from 'react-redux';
import { store } from './lib/store';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
