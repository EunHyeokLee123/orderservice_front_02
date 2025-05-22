import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/UserContext';
import CartContext from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { set, throttle } from 'lodash';

const ProductList = ({ pageTitle }) => {
  const [searchType, setSearchType] = useState('optional');
  const [searchValue, setSearchValue] = useState('');
  const [productList, setProductList] = useState([]);
  const [selected, setSelected] = useState({});
  // 현재 페이지를 저장하는 상태 변수 -> 무한 스크롤 기능을 구현하기 위해 선언
  const [currentPage, setCurrentPage] = useState(0);
  // 마지막 페이지 여부
  const [isLastPage, setLastPage] = useState(false);

  // 현재 로딩중인지 여부 -> 백엔드로부터 상품 목록 요청을 보내서 아직 데이터를 받아오는 중인가?
  // 요청의 중복을 줄이고, 요청이 무시되지 않게 하기 위해서
  const [isLoading, setIsLoading] = useState(false);

  // 한 페이지에 보여줄 상품 개수
  const pageSize = 15;

  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'ADMIN';

  const { addCart } = useContext(CartContext);

  const navigate = useNavigate();

  useEffect(() => {
    loadProduct(); // 처음 화면에 진입하면 1페이지 내용을 보여주지 -> 매개값 필요없음
    // BOM의 최상위 객체 window에 이벤트를 걸음 -> 브라우저 자체에 스크롤 이벤트를 걸음

    // 쓰로틀링: 짧은 시간동안 연속해서 발생한 이벤트들을 일정 시간으로 그룹화 하여
    // 순차적으로 적용할 수 있게 하는 기능. -> 스크롤 페이징
    // 디바운싱: 짧은 시간동안 연속해서 발생한 이벤트를 호출하지 않다가 마지막 이벤트로부터
    // 일정 시간 이후에 한번만 호출하게 하는 기능. -> 입력값 검증

    // throttle -> (쓰로트링을 걸고 싶은 함수, 대기시간(ms))
    // 쓰로틀링이 적용된 함수를 리턴해줌.
    const throttledScroll = throttle(scrollPagination, 1000);

    window.addEventListener('scroll', throttledScroll);

    // 클린업 함수: 다른 컴포넌트가 렌더링 될 때에는 이벤트를 해제하자.
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  useEffect(() => {
    // useEffect는 하나의 컴포넌트에서 여러 개 선언이 가능함.
    // 스크롤 이벤트에서 다음 페이지 번호를 준비해줌
    // 여기서는 currentPage의 상태가 바뀌면 백엔드로 요청을 보낼수 있게 로직을 분리하자!
    if (currentPage > 0) {
      loadProduct();
    }
  }, [currentPage]);

  // 상품 목록을 백엔드에 요청하는 함수
  const loadProduct = async (number, size) => {
    // 로딩중이거나 이미 마지막 페이지라면 더이상 요청을 보내지 말자!
    if (isLoading || isLastPage) return;

    console.log('아직 보여줄 아이템이 남았음!');

    let params = {
      size: pageSize,
      page: currentPage,
    };

    // 만약 사용자가 조건을 선택했고, 검색어를 입력했다면 프로퍼티를 추가하자
    // 사용자가 검색조건을 선택했고, 검색어가 입력이 되었다면
    if (searchType !== 'optional' && searchValue) {
      params.category = searchType;
      params.searchName = searchValue;
    }

    // 요청 보내기 직전에 로딩상태를 true로 하자 -> 로딩중이니까
    setIsLoading(true);

    try {
      // axios.get의 매개변수로 객체를 url뒤에 넘겨주면, 객체의 프로퍼티들을 보고 url뒤에
      // 쿼리식으로 붙여줌.
      const res = await axios.get(
        'http://localhost:8000/product-service/product/list',
        {
          params,
        },
      );
      const data = await res.data;

      // 요청을 보냈는데, 길이가 0이다? -> 더이상 불러올 데이터가 없다는 의미
      // 이제 스크롤을 내려도 불러오지 말자!
      if (data.result.length === 0) {
        setLastPage(true);
      } else {
        // 전달받은 상품 리스트를 상품 목록 상태변수에 세팅
        setProductList((prev) => [...prev, ...data.result]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      // 요청에 대한 응답 처리가 끝나고 난 후 로딩 상태를 다시 false로 바꾸자!
      setIsLoading(false);
    }
  };

  //
  const scrollPagination = () => {
    // 브라우저 창의 높이 + 현재 페이지에서 스크롤 된 픽셀 값
    //>= (스크롤이 필요 없는)페이지 전체 높이에서 100px 이내에 도달했는가?
    const isBottom =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.scrollHeight - 100;
    if (isBottom && !isLastPage && !isLoading) {
      // 스크롤이 특정 구간에 도달하면 바로 요청 보내는 게 아니라 다음 페이지 번호를 준비하겠다.
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  // 장바구니 클릭 이벤트 핸들러
  const handleAddToCart = () => {
    // 특정 객체에서 key값만 뽑아서 문자열 배열로 리턴해주는 메소드
    const selectedProduct = Object.keys(selected);

    // key값만 뽑아서 selected에 들어있는 상품 중에 false는 제거하고 true만 카트에 담자.
    const filtered = selectedProduct.filter((key) => selected[key]);

    // 사용자가 선택한 수량까지 파악해서 장바구니에 넣어주자.
    const finalSelected = filtered.map((key) => {
      const product = productList.find((p) => p.id === parseInt(key));
      return {
        id: product.id,
        name: product.name,
        quantity: product.quantity,
      };
    });
    console.log(finalSelected);
    if (finalSelected.length < 1) {
      alert('장바구니에 담을 상품을 선택하세요.');
      return;
    }

    for (let p of finalSelected) {
      if (!p.quantity) {
        alert('수량이 0개인 상품은 담을 수 없습니다.');
        return;
      }
    }

    if (confirm('상품을 장바구니에 추가하시겠습니까?')) {
      // 카트로 상품을 보내주자.
      alert('선택한 상품이 장바구니에 추가되었습니다.');
      console.log(finalSelected);

      finalSelected.forEach((product) => addCart(product));
      navigate('/order/cart');
    }
  };

  // 체크박스 클릭 이벤트 핸들러
  const handleCheckboxChange = (productId, checked) => {
    // 사용자가 특정 상품을 선택했는지에 대한 상태를 관리
    setSelected((prev) => ({
      ...prev,
      [productId]: checked,
    }));
  };

  return (
    <Container>
      <Grid
        container
        justifyContent='space-between'
        spacing={2}
        className='mt-5'
      >
        <Grid item>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // 검색 렌더링 진행 시 기존 목록을 지우고
              // 다시 렌더링을 진행해야함.
              setProductList([]);
              setCurrentPage(0);
              setIsLoading(false);
              setLastPage(false);
              //
              loadProduct();
            }}
          >
            <Grid container spacing={2}>
              <Grid item>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value='optional'>선택</MenuItem>
                  <MenuItem value='name'>상품명</MenuItem>
                  <MenuItem value='category'>카테고리</MenuItem>
                </Select>
              </Grid>
              <Grid item>
                <TextField
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  label='Search'
                />
              </Grid>
              <Grid item>
                <Button type='submit'>검색</Button>
              </Grid>
            </Grid>
          </form>
        </Grid>

        {!isAdmin && (
          <Grid item>
            <Button onClick={handleAddToCart} color='secondary'>
              장바구니에 담기
            </Button>
          </Grid>
        )}

        {isAdmin && (
          <Grid item>
            <Button href='/product/create' color='success'>
              상품등록
            </Button>
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' align='center'>
            {pageTitle}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>제품사진</TableCell>
                <TableCell>제품명</TableCell>
                <TableCell>가격</TableCell>
                <TableCell>재고수량</TableCell>
                {!isAdmin && <TableCell>주문수량</TableCell>}
                {!isAdmin && <TableCell>주문선택</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {productList.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.imagePath}
                      alt={product.name}
                      style={{ height: '100px', width: 'auto' }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  {!isAdmin && (
                    <TableCell>
                      <TextField
                        type='number'
                        value={product.quantity || 0}
                        // 수량이 변경될 때마다 productList에서 지금 수량이 변경된 상품을 찾아서
                        // quantity라는 새로운 프로퍼티에 값을 세팅하겠다.
                        onChange={(e) =>
                          setProductList((prevList) =>
                            prevList.map((p) =>
                              p.id === product.id
                                ? { ...p, quantity: parseInt(e.target.value) }
                                : p,
                            ),
                          )
                        }
                        style={{ width: '70px' }}
                      />
                    </TableCell>
                  )}
                  {!isAdmin && (
                    <TableCell>
                      <Checkbox
                        // !! -> boolean이 아닌 객체를 truthy, falsy를 통해
                        // boolean 값으로 바꿀 수 있음.
                        checked={!!selected[product.id]}
                        onChange={(e) =>
                          handleCheckboxChange(product.id, e.target.checked)
                        }
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductList;
