/*
 *
 * ProductList reducer
 *
 */
import produce from 'immer';
import { DEFAULT_ACTION, GET_PRODUCTS, GET_PRODUCTS_SUCCESS, ADD_PRODUCT, ADD_PRODUCT_SUCCESS, DELETE_PRODUCT, DELETE_PRODUCT_SUCCESS, EDIT_PRODUCT, EDIT_PRODUCT_SUCCESS } from './constants';

export const initialState = {
  products: []
};

/* eslint-disable default-case, no-param-reassign */
const productListReducer = (state = initialState, action) =>
  produce(state, ( draft ) => {
    let { products } = state.products;
    switch (action.type) {
      case DEFAULT_ACTION:
        break;
      case GET_PRODUCTS:
        break;
      case GET_PRODUCTS_SUCCESS:
        draft.products = action.response;
        return draft;
      case ADD_PRODUCT:
        console.log('reducer >> ', action.data);
        break;
      case ADD_PRODUCT_SUCCESS:
        console.log(action.response);
        draft.products.products.unshift({
          id: action.response.newProductId,
          title: action.response.data,
        });
        return draft;
      case DELETE_PRODUCT:
        console.log('inside reducer >>> ', action);
        break;
      case DELETE_PRODUCT_SUCCESS:
        console.log('action delete -> ', action.response);
        //draft.isDeleted = action.response.isDeleted;
        //draft.msg = action.response.msg;
        products = state.products;
        console.log("before delete: ",products);
        products = products.products.filter(item => item.id != action.response.id);
        console.log('products after deleting');
        console.log(products);
        draft.products.products = products;
        return draft;
      case EDIT_PRODUCT:
        console.log('inside reducer >>> ', action);
        break;
      case EDIT_PRODUCT_SUCCESS:
        console.log('action -> ', action.response);
        products = state.products;
        console.log(products.products)
        products = products.products.map(el => {if(el.id == action.response.id){console.log("now see what happen: ",el);el.title = action.response.newVal} return el;});
        console.log('products after editing');
        console.log(products);
        draft.products.products = products;
        return draft;
    } 
  });

export default productListReducer;
