const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getCategories, getSuggestions } = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/categories', getCategories);
router.get('/suggestions', getSuggestions);
router.get('/:id', getProductById);

module.exports = router;