const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.send('RealBank - RESTfull API por Inés Montero');
});

module.exports = router;
