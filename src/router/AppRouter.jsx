import React from 'react';
import Home from '../components/Home';
import LoginPage from '../components/LoginPage';
import MemberCreate from '../components/MemberCreate';
import ProductList from '../components/ProductList';
import OrderPage from '../components/OrderPage';
import MyPage from '../components/MyPage';
import ProductCreate from '../components/ProductCreate';
import { Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRouter';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/member/create' element={<MemberCreate />} />
      <Route path='/product/list' element={<ProductList />} />
      <Route
        path='/order/cart'
        element={<PrivateRouter element={<OrderPage />} />}
      />
      <Route path='/mypage' element={<PrivateRouter element={<MyPage />} />} />
      <Route
        path='/product/manage'
        element={
          <PrivateRouter element={<ProductCreate />} requiredRole='ADMIN' />
        }
      />
    </Routes>
  );
};

export default AppRouter;
