var express = require('express');
var router = express.Router();

/* GET home pag. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Workiji' });
});


router.get('/city', function(req, res, next) {
    res.render('city', { title: 'City' });
});

module.exports = router;
