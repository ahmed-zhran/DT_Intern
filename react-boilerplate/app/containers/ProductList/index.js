/**
 *
 * ProductList
 *
 */
import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectProductList from './selectors';
import reducer from './reducer';
import saga from './saga';
import { getProducts, addProduct, editProduct, deleteProduct } from './actions';

export function ProductList(props) {
  useInjectReducer({ key: 'productList', reducer });
  useInjectSaga({ key: 'productList', saga });
  //useEffect
  useEffect(() => {
    //props.getProducts();
    if (
      props.productList &&
      props.productList.products &&
      props.productList.products.length === 0
    ) {
      props.getProducts();
      //console.log("after fetching: ",props.productList);
    }
  }, [props.productList.products, props.productList.products.products]);
  //logged
  //console.log("here",props.productList.products);
  const prods = props.productList.products.products;

  //handle on change and addition
  const [data, setData] = useState("");
  const handleOnChange = (e) => {
    setData(e.target.value);
    //console.log(data);
  }
  const handleAdd = () =>{
    console.log(data);
    props.addProduct(data);
    setData("");
  }

  //handle editing
  const handleEdit = (id) => {
    let value = prompt('enter new title');
    if(value){
      console.log(value," ",id);
      props.editProduct({value: value,id: id});
    }
  }
  //handle deletion
  const handleDelete = (id) => {
    console.log(id);
    props.deleteProduct(id);
  }
  return (
    <div>
      <Helmet>
        <title>ProductList</title>
        <meta name="description" content="Description of ProductList" />
      </Helmet>
      <div>
        <input type="text" onChange={(e) => handleOnChange(e)}></input>
        <button onClick={()=>handleAdd()}>add</button>
      </div>
      <div>
        {prods && prods.length && prods.map((el, indx) => {
          return( 
            <div key={indx}>
            <h5>{el.title}</h5> 
            <button onClick={ () => handleEdit(el.id) }>edit</button>
            <button onClick={ () => handleDelete(el.id) }>delete</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

ProductList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  getProducts: PropTypes.func,
  props: PropTypes.any,
};

const mapStateToProps = createStructuredSelector({
  productList: makeSelectProductList(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    getProducts: () => dispatch(getProducts()),
    addProduct: title => dispatch(addProduct(title)),
    deleteProduct: id => dispatch(deleteProduct(id)),
    editProduct: data => dispatch(editProduct(data))
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(ProductList);
