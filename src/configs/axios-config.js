// 여기에서 axios 인스턴스를 생성하고,
// interceptor 기능을 활용하여, access token이 만료되었을 때 refresh token을 사용하여
// 새로운 access token을 발급받는 비동기 방식의 요청을 모듈화. (fetch는 interceptor 기능 x)
// axios 인스턴스는 token이 필요한 모든 요청에 활용 될 것입니다.

import axios from 'axios';

// Axios 인스턴스 생성
// 이제부터 토큰이 필요한 요청은 그냥 axios가 아니라
// 지금 만드는 이 인스턴스를 이용해 요청을 보내겠다.
const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
Axios Interceptor는 요청 또는 응답이 처리되기 전에 실행되는 코드입니다.
요청을 수정하거나, 응답에 대한 결과 처리를 수행할 수 있습니다.
*/

// 요청용 인터셉터 선언
// 인터셉터의 use는 매개값은 콜백함수 2개를 받음
// 1은 정상 동작 로직
// 2는 과정중 에러 발생 시 실행할 로직
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 보내기 전에 항상 처리해야할 내용을 콜백으로 전달
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    // 더 이상 비동기 요청이 진행되지 않게 하기 위해
    // reject 호출 시 요청 취소
    Promise.reject(error);
  },
);

// 응답용 인터셉터 설정
axiosInstance.interceptors.response.use(
  // 응답에 문제가 없다면 그대로 응답 객체 리턴
  (response) => {
    return response;
  },
  async (error) => {
    console.log('response Interceptor 동작함! 응답에 문제 발생');
    console.log(error);

    if (error.response.data.message === 'NO_LOGIN') {
      console.log('아예 로그인을 하지 않아서 재발급 요청을 할 수 없음');
      // 더 이상 비동기 요청이 진행되지 않게 하기 위해
      // reject 호출 시 요청 취소
      return Promise.reject(error);
    }

    // 원래 요청 정보를 기억해두자 -> 새 토큰 발급 받아서 다시 시도할거니까
    const originalRequest = error.config;

    // token 재발급 로직 진행 -> 로그인은 했는데, 만료된거라서
    if (error.response.status === 401) {
      console.log('응답상태 401 발생! 토큰 재발급 필요!');

      try {
        const id = localStorage.getItem('USER_ID');

        const res = await axios.post(
          'http://localhost:8000/user-service/user/refresh',
          {
            id,
          },
        );

        const newToken = res.data.result.token;

        // token 갱신
        localStorage.setItem('ACCESS_TOKEN', newToken);

        // 실패한 원본 요청 정보에서 Authorization의 값을 새로운 token으로 갱신
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // axios 인스턴스의 headers Authorization도 token을 갱신하자
        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`;

        // axiosInstance를 사용하여 다시 한번 요청을 보내고,
        // 응답은 원래 호출한 곳으로 리턴
        return axiosInstance(originalRequest);
      } catch (error) {
        console.log(error);
        // 백엔드에서 401을 보냄 -> Refresh도 만료된 경우 -> 로그아웃처럼 처리해야함.
        localStorage.clear();
        // 재발급 요청도 거절당한 경우
        // 인스턴스를 호출한 곳으로 에러 정보 전달
        return Promise.reject(error);
      }
    }
  },
);

export default axiosInstance;
