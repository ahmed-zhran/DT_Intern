 import { take, call, put, select, all, takeLatest } from 'redux-saga/effects';
import { ADD_PRODUCT, GET_PRODUCTS, DELETE_PRODUCT, EDIT_PRODUCT } from './constants';
import request from '../../utils/request';
import {
  getProductsSuccess,
  addProductSuccess,
  deleteProductSuccess,
  editProductSuccess
} from './actions';


//getting data
export function* getProducts() {
  const req = 'https://dummyjson.com/products';
  try {
    const products = yield call(request, req);
    yield put(getProductsSuccess(products));
    console.log('inside saga Products > ', products);
  } catch (error) {
    console.log(error);
  }
}
//adding data
export function* addProduct(action) {
  console.log("inside saga", action);
  const reqUrl = `https://dummyjson.com/products/add`;
  try {
    const options = {
      method: 'POST',
      body: action.data,
    };
    const newProduct = yield call(request, reqUrl, options);
    console.log('newProduct >>> ', newProduct);
    if (newProduct) {
      yield put(
        addProductSuccess({
          isNewProductAdded: true,
          msg: `new product( ${action.data} ) is added successfully`,
          newProductId: newProduct.id,
          data: action.data
        }),
      );
    }
  } catch (error) {
    console.log(error);
  }
}
//deleting data
export function* deleteProduct(action) {
  console.log('inside saga >>>  ', action.id);
  const reqUrl = `https://dummyjson.com/products/${action.id}`;
  if(action.id > 100){
    yield put(
      deleteProductSuccess({
        isDeleted: true,
        msg: `Item with id ${action.id} Deleted successfully`,
        id: action.id
      }),
    );
  }else{
    try {
      const options = {
        method: 'DELETE',
      };
      const isDeleted = yield call(request, reqUrl, options);
      if (isDeleted) {
        yield put(
          deleteProductSuccess({
            isDeleted: true,
            msg: `Item with id ${action.id} deleted successfully`,
            id: action.id
          }),
        );
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  }
  
}
////editing 
export function* editProduct(action) {
  console.log('inside saga edit >>>  ', action);
  const reqUrl = `https://dummyjson.com/products/${action.id}`;
  if(action.id > 100){
    yield put(
      editProductSuccess({
        isEdited: false,
        msg: `Item with id ${action.id} Edited successfully`,
        id: action.id,
        newVal: action.value
      }),
    );
  }else{
    try {
      const options = {
        method: 'PUT',
      };
      const isEdited = yield call(request, reqUrl, options);
      if (isEdited) {
        yield put(
          editProductSuccess({
            isEdited: true,
            msg: `Item with id ${action.id} Edited successfully`,
            id: action.id,
            newVal: action.value
          }),
        );
      } else {
      }
    } catch (error) {
      console.log(error);
    }
  }
  
}



// Individual exports for testing
export default function* productListSaga() {
  // See example in containers/HomePage/saga.js
  console.log("inside productList saga")
    yield all([
      takeLatest(GET_PRODUCTS, getProducts),
      takeLatest(ADD_PRODUCT, addProduct),
      takeLatest(DELETE_PRODUCT, deleteProduct),
      takeLatest(EDIT_PRODUCT, editProduct)
    ]) 
}
