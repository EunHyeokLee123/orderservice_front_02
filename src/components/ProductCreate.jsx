import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  TextField,
} from '@mui/material';
import React, { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import addImage from '../assets/image-add.png';
import axiosInstance from '../configs/axios-config';
import { API_BASE_URL, PROD } from '../configs/host-config';
import { handleAxiosError } from '../configs/HandleAxiosError';
import AuthContext from '../context/UserContext';

const ProductCreate = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [productImage, setProductImage] = useState(null); // 백엔드로 보낼 파일 그 자체
  const [thumbnailImage, setThumbnailImage] = useState(null); // 화면단에 표시할 썸네일
  const navigate = useNavigate();
  const { onLogout } = useContext(AuthContext);

  const $fileTag = useRef();

  const productCreate = async (e) => {
    e.preventDefault();

    try {
      const registerData = new FormData();
      registerData.append('name', name);
      registerData.append('price', price);
      registerData.append('category', category);
      registerData.append('stockQuantity', stockQuantity);
      registerData.append('productImage', productImage);

      // axiosInstance의 기본 컨텐트 타입은 JSON임
      // 이번에는 form-data를 보내야 해서,
      // header의 컨텐트 타입을 직접 명시해야함.
      const res = await axiosInstance.post(
        `${API_BASE_URL}${PROD}/create`,
        registerData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      alert('상품 등록 완료1');
      navigate('/product/list');
    } catch (e) {
      handleAxiosError(e, onLogout, navigate);
    }
  };

  // 사용자가 파일을 선택해서 업로드하면 정보를 읽어들여서
  // 썸네일 띄우는 함수
  const fileUpdate = () => {
    const file = $fileTag.current.files[0];

    const reader = new FileReader();

    reader.readAsDataURL(file);

    setProductImage(file); // 백엔드로 보낼 데이터는 파일 원본에 넣고

    reader.onloadend = () => {
      setThumbnailImage(reader.result); // 썸네일은 FileReader의 처리 결과값을 세팅
    };
  };

  return (
    <Container>
      <Grid container justifyContent='center'>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title='상품등록' style={{ textAlign: 'center' }} />
            <CardContent>
              <form onSubmit={productCreate}>
                <div
                  className='thumbnail-box'
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '20px',
                  }}
                  onClick={() => $fileTag.current.click()}
                >
                  <img
                    src={thumbnailImage || addImage}
                    alt='prod-image'
                    style={{ width: '225px' }}
                  />
                </div>
                <TextField
                  label='상품명'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                />
                <TextField
                  label='카테고리'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                />
                <TextField
                  label='가격'
                  type='number'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                />
                <TextField
                  label='재고수량'
                  type='number'
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  fullWidth
                  margin='normal'
                  required
                />
                <input
                  type='file'
                  accept='image/*'
                  onChange={fileUpdate}
                  style={{ display: 'none' }}
                  required
                  ref={$fileTag}
                />
                <Button
                  type='submit'
                  color='primary'
                  variant='contained'
                  fullWidth
                >
                  등록
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductCreate;
