const express = require('express');

const router = express.Router();

const adminData = require('./admin');
const {
  getIndex,
  getProducts,
  getProduct,
  postCart,
  getCart,
  postCartDeleteProduct,
  postOrder,
  getOrders
} = require('../controllers/shop');

router.get('/', getIndex);

router.get('/products', getProducts);

// details page route
router.get('/products/:productId', getProduct);

router.post('/cart', postCart);

router.get('/cart', getCart);

router.post('/cart-delete-item', postCartDeleteProduct);

router.post('/create-order', postOrder);

router.get('/orders', getOrders);

module.exports = router;