import React from 'react';
import ReactDOM from 'react-dom/client';
import PopupComponent from './PopupComponent';
import 'rsuite/dist/rsuite.min.css';

const root = document.getElementById('popup-root');

// Use createRoot to render your component in React 18
const rootElement = ReactDOM.createRoot(root);
rootElement.render(
    <PopupComponent />
);

  