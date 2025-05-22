import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import axiosInstance from '../configs/axios-config';
import { useNavigate } from 'react-router-dom';
import { handleAxiosError } from '../configs/HandleAxiosError';
import OrderListComponent from './OrderListComponent';

const MyPage = () => {
  const [memberInfoList, setMemberInfoList] = useState([]);
  const { userRole, onLogout } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    // 회원 정보를 불러오기
    /*
      이름, 이메일, 도시, 상세주소 우편번호를 노출해야 합니다.
      위 5가지 정보를 객체로 포장해서 memberInfoList에 넣어주세요.
      */

    const fetchMemberInfo = async () => {
      try {
        const role = localStorage.getItem('USER_ROLE');
        const url =
          role === 'ADMIN'
            ? 'http://localhost:8000/user-service/user/list'
            : 'http://localhost:8000/user-service/user/myInfo';

        const res = await axiosInstance.get(url);

        // admin인 경우는 list로 리턴되고, user인 경우에는 객체로 넘어오기에
        // 배열 고차함수를 일괄적으로 사용하기 위해 배열로 감싸서 리턴하자.
        const data = role === 'ADMIN' ? res.data.result : [res.data.result];

        setMemberInfoList((prev) => {
          return data.map((user) => [
            { key: '이름', value: user.name },
            { key: '이메일', value: user.email },
            { key: '도시', value: user.address?.city || '등록 전' },
            {
              key: '상세주소',
              value: user.address?.street || '등록 전',
            },
            {
              key: '우편번호',
              value: user.address?.zipCode || '등록 전',
            },
          ]);
        });
      } catch (e) {
        handleAxiosError(e, onLogout, navigate);
      }
    };

    fetchMemberInfo();
  }, []);

  return (
    <Container>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='회원정보' style={{ textAlign: 'center' }} />
            {memberInfoList.map((element, index) => (
              <CardContent>
                <Table>
                  <TableBody key={index}>
                    {element.map((info, index) => (
                      <TableRow key={index}>
                        <TableCell>{info.key}</TableCell>
                        <TableCell>{info.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            ))}
          </Card>
        </Grid>
      </Grid>

      {/* OrderListComponent */}
      <OrderListComponent isAdmin={userRole === 'ADMIN'} />
    </Container>
  );
};

export default MyPage;
