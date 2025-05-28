import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Grid,
  TextField,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { API_BASE_URL, USER } from '../configs/host-config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { onLogin } = useContext(AuthContext);

  // 환경변수에서 가져오기
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  useEffect(() => {
    const handleMessage = (e) => {
      // origin (브라우저 호스트 주소)을 비교하여 이벤트 발생 상황 외에는 동작하지 않게
      if (
        e.origin !== 'http://localhost:8000' &&
        e.origin !== window.location.origin
      ) {
        return;
      }
      if (e.data.type === 'OAUTH_SUCCESS') {
        alert('카카오 로그인 성공!');
        onLogin(e.data);
        navigate('/');
      }
    };
    // 브라우저에 이벤트 바인딩 -> 백엔드에서 postMessage를 통해 부모 창으로 데이터를 전송
    // 부모창에 message를 수신하는 이벤트를 지정해서 해당 데이터를 읽어오겠다.
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin, navigate]);

  const handleGoogleLogin = () => {
    console.log('구글 로그인 버튼 클릭됨!');
  };

  const handleKaKaoLogin = () => {
    console.log('카카오 로그인 버튼 클릭!');
    // 로그인 팝업창 열기
    const popup = window.open(
      `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`,
      // 팝업 창 이름 -> 임의로 설정
      'kakao-login',
      // 팝업창의 디자인 설정
      'width=500,height=600,scrollbars=yes,resizable=yes',
    );
  };

  const doLogin = async (e) => {
    const loginData = {
      email,
      password,
    };

    /*
    const res = await fetch('http://localhost:8181/user/doLogin', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await res.json();

    // 로그인 성공
    if (res.status === 200) {
      alert('로그인 성공!');
      // 로그인을 성공하면 Map이 옴.
      // id, role, token이 들어있음.
      onLogin(data.result);
      navigate('/');
    }
    // 로그인 실패
    else {
      alert('로그인 실패입니다. 아이디 혹은 비밀번호를 다시 입력하세요.');
    }
      */
    try {
      const res = await axios.post(`${API_BASE_URL}${USER}/doLogin`, loginData); // 로그인은 토큰을 안보내도 되서 headers를 비워도 됨

      alert('로그인 성공!');
      onLogin(res.data.result);
      navigate('/');
    } catch (err) {
      console.log(err);
      alert('로그인 실패입니다. 아이디 혹은 비밀번호를 다시 입력하세요.');
    }
  };

  return (
    <Grid container justifyContent='center'>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardHeader title='로그인' style={{ textAlign: 'center' }} />
          <CardContent>
            {/* 소셜 로그인 섹션 */}
            <Box mb={3}>
              <Button
                variant='outlined'
                fullWidth
                onClick={handleGoogleLogin}
                sx={{
                  mb: 2,
                  borderColor: '#4285f4',
                  color: '#4285f4',
                  '&:hover': {
                    borderColor: '#3367d6',
                    backgroundColor: '#f8f9fa',
                  },
                  textTransform: 'none',
                  fontSize: '16px',
                  height: '48px',
                }}
                startIcon={
                  <img
                    src='https://developers.google.com/identity/images/g-logo.png'
                    alt='Google'
                    style={{ width: '20px', height: '20px' }}
                  />
                }
              >
                Google로 로그인
              </Button>

              <Button
                variant='outlined'
                fullWidth
                onClick={handleKaKaoLogin}
                sx={{
                  mb: 2,
                  borderColor: '#fee500',
                  color: '#3c1e1e',
                  backgroundColor: '#fee500',
                  '&:hover': {
                    borderColor: '#fdd835',
                    backgroundColor: '#fdd835',
                  },
                  textTransform: 'none',
                  fontSize: '16px',
                  height: '48px',
                }}
                startIcon={
                  <img
                    src='https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png'
                    alt='Kakao'
                    style={{ width: '20px', height: '20px' }}
                  />
                }
              >
                Kakao로 로그인
              </Button>

              <Box display='flex' alignItems='center' my={3}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant='body2'
                  sx={{ px: 2, color: 'text.secondary' }}
                >
                  또는
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
            </Box>

            {/* 기존 로그인 폼 */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                doLogin();
              }}
            >
              <TextField
                label='Email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <TextField
                label='Password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin='normal'
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button color='secondary' fullWidth>
                    비밀번호 변경
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    type='submit'
                    color='primary'
                    variant='contained'
                    fullWidth
                  >
                    로그인
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* 비밀번호 변경 모달 */}
      {/* <Dialog open={resetPassword} onClose={() => setResetPassword(false)}>
            <ResetPasswordModal handleClose={() => setResetPassword(false)} />
          </Dialog> */}
    </Grid>
  );
};

export default LoginPage;
