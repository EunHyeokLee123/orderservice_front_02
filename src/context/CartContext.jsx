import React, { useReducer } from 'react';

// 리듀서 함수 정의
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CART':
      const existProduct = state.productsInCart.find(
        (p) => p.id === action.product.id,
      );
      let updatedProduct;
      let totalQuantity = (state.totalQuantity += action.product.quantity);

      if (existProduct) {
        // 이미 카트에 있는 상품이구나
        // 다른 상품은 현상 유지를 하고, 해당 상품의 수량만 늘리자
        updatedProduct = state.productsInCart.map((p) =>
          p.id === action.product.id
            ? { ...p, quantity: p.quantity + action.product.quantity }
            : p,
        );
      } else {
        // 처음 담기는 상품이구나
        // 기존 로직 그대로 유지하자.
        updatedProduct = [...state.productsInCart, action.product];
      }

      // 세션 스토리지에 카트 상태를 저장 -> 새로고침해도 장바구니 정보가 유지가 되게끔
      // 로컬, 세션 스토리지에 저장하는 데이터가 객체 혹은 배열인 경우 저장이 되지 않음
      // 문자열로 바꿔서 저장해야함. -> JSON 문자열화해서 넣자.

      sessionStorage.setItem('productsInCart', JSON.stringify(updatedProduct));
      sessionStorage.setItem('totalQuantity', totalQuantity);

      return {
        productsInCart: updatedProduct,
        totalQuantity,
      };

    case 'CLEAR_CART':
      sessionStorage.clear();
      return {
        productsInCart: [],
        totalQuantity: 0,
      };
  }
};

// 새로운 Context 생성
const CartContext = React.createContext({
  productsInCart: JSON.parse(sessionStorage.getItem('productsInCart')) || [],
  totalQuantity: parseInt(sessionStorage.getItem('totalQuantity')) || 0,
  addCart: () => {},
  clearCart: () => {},
});

export const CartContextProvider = (props) => {
  const [cartState, dispatch] = useReducer(cartReducer, undefined, () => {
    const storedProducts = sessionStorage.getItem('productsInCart');
    const storedQuantity = sessionStorage.getItem('totalQuantity');

    return {
      productsInCart: storedProducts ? JSON.parse(storedProducts) : [],
      totalQuantity: storedQuantity ? parseInt(storedQuantity, 10) : 0,
    };
  });

  const addCart = (product) => {
    dispatch({
      type: 'ADD_CART',
      product,
    });
    // console.log('장바구니: ', cartState);
  };

  const clearCart = () => {
    dispatch({
      type: 'CLEAR_CART',
    });
  };

  return (
    <CartContext.Provider
      value={{
        productsInCart: cartState.productsInCart,
        totalQuantity: cartState.totalQuantity,
        addCart,
        clearCart,
      }}
    >
      {props.children}
    </CartContext.Provider>
  );
};

export default CartContext;
