const express = require('express');

const router = express.Router();

const {
    getAddProduct,
    getProducts,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    postDeleteProduct
} = require('../controllers/admin');

const products = [];

// /admin/add-product => GET
router.get('/add-product', getAddProduct);

// /admin/products => GET
router.get('/products', getProducts);

// /admin/add-product => POST
router.post('/add-product', postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product', postEditProduct);

// /admin/delete-product => POST
router.post('/delete-product', postDeleteProduct);

exports.routes = router;
exports.products = products;