import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import './App.css';
import MemberCreate from './components/MemberCreate';
import AuthContext, { AuthContextProvider } from './context/UserContext';
import LoginPage from './components/LoginPage';
import ProductList from './components/ProductList';
import { CartContextProvider } from './context/CartContext';
import OrderPage from './components/OrderPage';
import MyPage from './components/MyPage';
import ProductCreate from './components/ProductCreate';
import AppRouter from './router/AppRouter';

const App = () => {
  return (
    <AuthContextProvider>
      <CartContextProvider>
        <div className='App'>
          <Header />
          <div className='content-wrapper'>
            <AppRouter />
          </div>
          <Footer />
        </div>
      </CartContextProvider>
    </AuthContextProvider>
  );
};

export default App;
