const { Router } = require('express');
const { createClient, getClients, updateClient } = require('../controllers/client.controller');

const router = Router();

router.post('/cliente/created', createClient);
router.get('/cliente/list', getClients);
router.patch('/cliente/update/:id', updateClient);

module.exports = router;