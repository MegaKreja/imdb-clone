const express = require('express');
const router = express.Router();

const listController = require('../controllers/ListController');

router.post('/favorite', listController.postFavorite);
router.post('/watchlist', listController.postWatchlist);
router.post('/rating', listController.postRating);
router.get('/:username/favorite', listController.favorite);
router.get('/:username/watchlist', listController.watchlist);
router.post('/total-rating', listController.totalRating);

module.exports = router;
