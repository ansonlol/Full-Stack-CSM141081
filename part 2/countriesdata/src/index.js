import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Import any global styles you have, like reset.css or general styling
import App from './App';  // Import the App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
