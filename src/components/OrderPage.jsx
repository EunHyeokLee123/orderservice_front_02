import {
  Button,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useContext } from 'react';
import CartContext from '../context/CartContext';
import axios from 'axios';
import axiosInstance from '../configs/axios-config';
import { handleAxiosError } from '../configs/HandleAxiosError';
import { API_BASE_URL, ORDER } from '../configs/host-config';

const OrderPage = () => {
  const { productsInCart, clearCart: onclear } = useContext(CartContext);

  const clearCart = () => {
    onclear();
  };

  const orderCreate = async () => {
    // 백엔드가 달라는 형태로 객체를 매핑하자
    const orederProducts = productsInCart.map((product) => ({
      productId: product.id,
      productQuantity: product.quantity,
    }));

    if (orederProducts.length < 1) {
      alert('주문 대상 물품이 없습니다.');
      return;
    }

    const yesOrno = confirm(
      `${orederProducts.length}개의 상품을 주문하겠습니까?`,
    );

    if (!yesOrno) {
      alert('주문이 취소되었습니다.');
      return;
    }

    /*
    const res = await fetch('http://localhost:8181/order/create', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('ACCESS_TOKEN'),
      },
      body: JSON.stringify(orederProducts),
    });
    */

    // axios 라이브러리를 사용해서 백엔드에게 요청을 보내보자!
    // axios.요청방식(url, 보낼 객체(JSON화 필요 X), header 정보)
    // axios는 200번대 정상 응답이 아닌 모든 것을 예외로 처리함
    // fetch는 400번대 응답에도 예외가 발생하지 않아 if문으로 처리가 가능하지만
    // axios는 if문이 아니라 try-catch문을 통해 예외를 처리해야함.
    try {
      const res = await axiosInstance.post(
        `${API_BASE_URL}${ORDER}/create`,
        orederProducts,
      );

      console.log('axios를 통해 전달받은 데이터: ', res);
      alert('주문이 완료되었습니다.');
      clearCart();
    } catch (err) {
      handleAxiosError(err);
    }
  };

  return (
    <Container>
      <Grid container justifyContent='center' style={{ margin: '20px 0' }}>
        <Typography variant='h5'>장바구니 목록</Typography>
      </Grid>
      <Grid
        container
        justifyContent='space-between'
        style={{ marginBottom: '20px' }}
      >
        <Button onClick={clearCart} color='secondary' variant='contained'>
          장바구니 비우기
        </Button>
        <Button onClick={orderCreate} color='primary' variant='contained'>
          주문하기
        </Button>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제품ID</TableCell>
              <TableCell>제품명</TableCell>
              <TableCell>주문수량</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productsInCart.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderPage;
