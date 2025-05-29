import {
  AppBar,
  Button,
  Container,
  Grid,
  Grid2,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useRef, useState } from 'react';
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

  // useRef로 SSE 연결값 참조 (리렌더링 시 초기화 안됨)
  const currentSSE = useRef(null);

  useEffect(() => {
    // 기존 연결이 있으면 해제를 하고, 새로 연결하겠다.
    if (currentSSE.current) {
      currentSSE.current.close();
      currentSSE.current = null;
    }

    console.log('role: ', userRole);
    const token = localStorage.getItem('ACCESS_TOKEN');

    if (userRole === 'ADMIN') {
      // 알림을 받기 위해 서버와 연결을 하기 위한 요청을 하겠다!
      currentSSE.current = new EventSourcePolyfill(
        `${API_BASE_URL}${SSE}/subscribe`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          /* 
          heartbeatTimeout: 2분동안 아무 메시지도 안 오면 연결이 끊어졌다고 판단
          2분 후 자동으로 연결을 끊고 재연결 시도
          
          retryDelayGrowth: 재연결 실패 시 대기시간 증가 비율 -> 실패할 때마다 대기 시간을 1.5배씩 증가
          1번째 1초 대기 -> 2번째 1.5초 대기 -> ....이런 식으로 대기시간이 증가

          maxRetryDelay: 재연결 대기 시간의 상한 값 -> 최대 30초 이상은 재연결을 대기하지 않겠다
          30초까지 재연결을 대기하다가, 더이상 재연결을 하지 않는다.

          */
          heartbeatTimeout: 30000,
          retryDelayGrowth: 1.5,
          maxRetryDelay: 30000,
        },
      );

      currentSSE.current.addEventListener('connect', (e) => {
        console.log(e);
      });

      // heartbeat 이벤트
      currentSSE.current.addEventListener('heartbeat', (e) => {
        console.log('Received Heartbeat');
      });

      currentSSE.current.addEventListener('new-order', (e) => {
        const orderData = JSON.parse(e.data);
        console.log(orderData);
      });

      currentSSE.current.onerror = (error) => {
        console.log('SSE 연결 오류 발생. 오류 원인은 ', error);
        // token 만료
        if (error.status === 401) {
          handleLogout();
        }
      };
    }
  }, [userRole]);

  const handleLogout = () => {
    if (currentSSE.current) {
      console.log('로그아웃으로 인해 SSE가 해제된다.');
      currentSSE.current.close();
      currentSSE.current = null;
    }

    onLogout();
    alert('로그아웃 완료');
    navigate('/');
  };

  // 페이지 언로드 시에도 연결 해제
  // 인터넷에 문제가 있거나, 관리자가 브라우저를 닫았을 때나 새로고침을 눌렀을 떄
  window.addEventListener('beforeunload', (e) => {
    if (currentSSE.current) {
      currentSSE.current.close();
    }
  });

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
