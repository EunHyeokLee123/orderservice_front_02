import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Grid,
  TextField,
} from '@mui/material';
import React, { useContext, useState } from 'react';
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
