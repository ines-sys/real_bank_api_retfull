const { Router } = require('express');
const { getCertificateBalance, getCertificateBalancePerClient, addDepositInCertificate, withdrawMoneyInCertficate } = require('../controllers/balance_and_deposit.controller');

const router = Router();

router.get('/certificado/balance/:id', getCertificateBalance);
router.get('/certificado/balancecliente/:idcliente', getCertificateBalancePerClient);
router.post('/certificado/deposito', addDepositInCertificate);
router.post('/certificado/retiro', withdrawMoneyInCertficate);

module.exports = router;