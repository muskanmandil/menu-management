const express = require('express');
const { allSubcategories, getSubcategory, createSubcategory, editSubcategory } = require('../controllers/subcategoryController');

const router = express.Router();
router.get('/all', allSubcategories);
router.get('/', getSubcategory);
router.post('/', createSubcategory);
router.patch('/:name', editSubcategory);


module.exports = router;