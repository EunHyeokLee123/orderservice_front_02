import {
  AppBar,
  Button,
  Container,
  Grid,
  Grid2,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { API_BASE_URL, SSE } from '../configs/host-config';

const Header = () => {
  // 로그인 상태에 따라 메뉴를 다르게 제공하고 싶다 -> 로그인 상태를 알아야함.
  const { isLoggedIn, userRole, onLogout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [liveQuantity, setLiveQuantity] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('role: ', userRole);
    const token = localStorage.getItem('ACCESS_TOKEN');

    if (userRole === 'ADMIN') {
      // 알림을 받기 위해 서버와 연결을 하기 위한 요청을 하겠다!
      const sse = new EventSourcePolyfill(`${API_BASE_URL}${SSE}/subscribe`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      sse.addEventListener('connect', (e) => {
        console.log(e);
      });

      // heartbeat 이벤트
      sse.addEventListener('heartbeat', (e) => {
        console.log('Received Heartbeat');
      });

      sse.addEventListener('ordered', (e) => {
        const orderData = JSON.parse(e.data);
        console.log(orderData);
        setLiveQuantity((prev) => prev + 1);
        setMessage(orderData.useEmail + '님의 주문!');
      });
    }
  }, [userRole]);

  const handleLogout = () => {
    onLogout();
    alert('로그아웃 완료');
    navigate('/');
  };

  return (
    <AppBar position='static'>
      <Toolbar>
        <Container>
          <Grid container alignItems='center'>
            {/* 왼쪽 메뉴 (관리자용) */}
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              {userRole === 'ADMIN' && (
                <>
                  <Button color='inherit' component={Link} to='/member/list'>
                    회원관리
                  </Button>
                  <Button color='inherit' component={Link} to='/product/manage'>
                    상품관리
                  </Button>
                  <Button color='inherit' onClick={() => setLiveQuantity(0)}>
                    실시간 주문 ({liveQuantity})
                  </Button>
                </>
              )}
            </Grid>

            {/* 가운데 메뉴 */}
            <Grid item xs={4} style={{ textAlign: 'center' }}>
              <Button color='inherit' component={Link} to='/'>
                <Typography variant='h6'>PlayData Shop</Typography>
              </Button>
            </Grid>

            {/* 오른쪽 메뉴 (사용자용) */}
            <Grid
              item
              xs={4}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Button color='inherit' component={Link} to='/product/list'>
                상품목록
              </Button>
              {isLoggedIn && (
                <>
                  <Button color='inherit' component={Link} to='/order/cart'>
                    장바구니
                  </Button>
                  <Button color='inherit' component={Link} to='/mypage'>
                    마이페이지
                  </Button>
                  <Button color='inherit' onClick={handleLogout}>
                    로그아웃
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Button color='inherit' component={Link} to='/member/create'>
                    회원가입
                  </Button>
                  <Button color='inherit' component={Link} to='/login'>
                    로그인
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
