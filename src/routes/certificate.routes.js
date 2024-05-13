const { Router } = require('express');
const { requestCertificate, getCertificates, getCertificateGain } = require('../controllers/certificate.controller');

const router = Router();

router.post('/certificado/request', requestCertificate);
router.get('/certificado/list', getCertificates);
router.get('/certificado/ganancia/:id', getCertificateGain);

module.exports = router;