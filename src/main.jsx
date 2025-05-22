import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

createRoot(document.getElementById('root')).render(
  // 라우터를 사용하려는 컴포넌트를 BrowserRouter로 감싸줌.
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
