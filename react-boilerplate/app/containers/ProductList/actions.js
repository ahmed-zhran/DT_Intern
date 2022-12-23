/*
 *
 * ProductList actions
 *
 */

import { DEFAULT_ACTION, GET_PRODUCTS, GET_PRODUCTS_SUCCESS, ADD_PRODUCT, ADD_PRODUCT_SUCCESS, DELETE_PRODUCT, DELETE_PRODUCT_SUCCESS, EDIT_PRODUCT, EDIT_PRODUCT_SUCCESS } from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}
//getting actions
export function getProducts() {
  return {
    type: GET_PRODUCTS,
  };
}
export function getProductsSuccess(response) {
  return {
    type: GET_PRODUCTS_SUCCESS,
    response
  };
}
//posting actions
export function addProduct(product) {
  console.log('inside addProduct >>>> ', product);
  return {
    type: ADD_PRODUCT,
    data: product,
  };
}
export function addProductSuccess(response) {
  return {
    type: ADD_PRODUCT_SUCCESS,
    response,
  };
}
//deleting actions
export function deleteProduct(id) {
  return {
    type: DELETE_PRODUCT,
    id
  }
}
export function deleteProductSuccess(response) {
  return {
    type: DELETE_PRODUCT_SUCCESS,
    response
  }
}
//editing actions
export function editProduct(data) {
  console.log("inside actions>> ",data);
  return {
    type: EDIT_PRODUCT,
    value: data.value,
    id: data.id
  }
}
export function editProductSuccess(response) {
  return {
    type: EDIT_PRODUCT_SUCCESS,
    response
  }
}


