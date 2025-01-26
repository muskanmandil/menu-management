const express = require('express');
const { allItems, getItems, createItem, editItem, searchItems } = require('../controllers/itemController');

const router = express.Router();
router.get('/all', allItems);
router.get('/', getItems);
router.post('/', createItem);
router.patch('/:name', editItem);
router.get('/search', searchItems);

module.exports = router;