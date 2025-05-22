import React, { useContext } from 'react';
import AuthContext from '../context/UserContext';
import { Navigate, useNavigate } from 'react-router-dom';

// 라우터 쪽에서 로그인 여부나 권한을 검사하는 기능을 담당하는
// PrivateRouter 생성.
const PrivateRouter = ({ element, requiredRole }) => {
  const { userRole, isLoggedIn, isInit } = useContext(AuthContext);

  // Context 데이터가 초기화되지 않았다면, 밑에 로직이 실행되지 않게끔 로딩 페이지 먼저 리턴
  if (!isInit) {
    return <div>로딩중.....</div>;
  }

  if (!isLoggedIn) {
    alert('로그인을 안했음!');

    // to = 보내고 싶은 렌더링 페이지 주소
    // replace = 사용자가 뒤로가기 버튼을 눌러도 이전 페이지로 돌아가지 않게 됨.
    return <Navigate to='/login' replace />;
  }

  // 요구되는 역할이 존재한다면, 현재 유저의 역할과 동일한지 확인
  if (requiredRole && userRole !== requiredRole) {
    alert('권한 없음!');
    return <Navigate to='/' replace />;
  }

  // 로그인도 했고, 권한에 문제가 없다면
  // 원래 렌더링하고자 했던 페이지를 리턴하자!
  return element;
};

export default PrivateRouter;
