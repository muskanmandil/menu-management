const express = require('express');
const { allCategories, getCategoryByName, createCategory, editCategory} = require('../controllers/categoryController');

const router = express.Router();
router.get('/all', allCategories);
router.get('/', getCategoryByName);
router.post('/', createCategory);
router.patch('/:name', editCategory);

module.exports = router;