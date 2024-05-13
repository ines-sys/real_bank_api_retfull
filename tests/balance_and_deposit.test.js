const assert = require('assert');
const request = require('supertest');
const app = require("../src/app");
const db = require('../src/database/db_connection');
const sinon = require('sinon'); 

describe('GET /certificado/balance/:id', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with formatted certificate balance
    it('responde con el balance formateado del certificado si la consulta a la base de datos es exitosa', (done) => {
        const fakeCertificateId = 1;
        const fakeCertificate = {
            balance: 1000,
        };

        queryStub.resolves({ rows: [fakeCertificate] });

        request(app)
            .get(`/certificado/balance/${fakeCertificateId}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.message);
                assert(res.body.body.balanceFormat);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 2: Error response when there is an error obtaining the certificate balance from the database
    it('responde con 500 si hay un error al obtener el balance del certificado desde la base de datos', (done) => {
        const fakeCertificateId = 1;

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .get(`/certificado/balance/${fakeCertificateId}`)
            .set('Accept', 'application/json')
            .expect(500)
            .end((err, res) => {
                assert.equal(res.status, 500);
                assert(res.body.error);
                assert(queryStub.calledOnce);
                done();
            });
    });
});

describe('GET /certificado/balancecliente/:idcliente', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with formatted certificate balances for the client
    it('responde con los balances formateados de los certificados para el cliente si la consulta a la base de datos es exitosa', (done) => {
        const fakeClientId = 1;
        const fakeCertificates = [
            { id: 1, cliente_id: fakeClientId, balance: 1000 },
            { id: 2, cliente_id: fakeClientId, balance: 2000 }
        ];

        queryStub.resolves({ rows: fakeCertificates });

        request(app)
            .get(`/certificado/balancecliente/${fakeClientId}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.message);
                assert(res.body.body.balances);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 2: Error response when there is an error obtaining the certificate balances for the client from the database
    it('responde con 500 si hay un error al obtener los balances de los certificados para el cliente desde la base de datos', (done) => {
        const fakeClientId = 1;

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .get(`/certificado/balancecliente/${fakeClientId}`)
            .set('Accept', 'application/json')
            .expect(500)
            .end((err, res) => {
                assert.equal(res.status, 500);
                assert(res.body.error);
                assert(queryStub.calledOnce);
                done();
            });
    });
});

describe('POST /certificado/deposito', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with confirmation of the deposit and updated balance
    it('responde con la confirmación del depósito y el balance actualizado si la consulta a la base de datos es exitosa', (done) => {
        const fakeRequestBody = { certificateId: 1, depositAmount: 500 };
        const fakeCertificate = { id: 1, balance: 1000 };

        queryStub.resolves({ rows: [fakeCertificate] });

        request(app)
            .post('/certificado/deposito')
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.message);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 2: Error response when there is an error depositing into the database
    it('responde con 500 si hay un error al realizar el depósito en la base de datos', (done) => {
        const fakeRequestBody = { certificateId: 1, depositAmount: 500 };

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .post('/certificado/deposito')
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(500)
            .end((err, res) => {
                assert.equal(res.status, 500);
                assert(res.body.error);
                assert(queryStub.calledOnce);
                done();
            });
    });
});

describe('POST /certificado/retiro', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with confirmation of the withdrawal and updated balance
    it('responde con la confirmación del retiro y el saldo actualizado si la consulta a la base de datos es exitosa', (done) => {
        const fakeRequestBody = { certificateId: 1, amountRetreat: 300 };
        const fakeCertificate = { id: 1, fecha_vencimiento: '2023-01-01', balance: 1000 };

        queryStub.resolves({ rows: [fakeCertificate] });

        request(app)
            .post('/certificado/retiro')
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.mensaje);
                assert(res.body.saldo);
                assert(res.body.estado);
                assert(queryStub.calledTwice);
                done();
            });
    });

    // Test 2: Error response when the withdrawal amount exceeds the certificate balance
    it('responde con 400 si el monto a retirar supera la cantidad de saldo en el certificado', (done) => {
        const fakeRequestBody = { certificateId: 1, amountRetreat: 1200 };
        const fakeCertificate = { id: 1, fecha_vencimiento: '2023-01-01', balance: 1000 };

        queryStub.resolves({ rows: [fakeCertificate] });

        request(app)
            .post('/certificado/retiro')
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert(res.body.error);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 3: Error response when there is an error withdrawing from the database
    it('responde con 500 si hay un error al realizar el retiro en la base de datos', (done) => {
        const fakeRequestBody = { certificateId: 1, amountRetreat: 300 };

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .post('/certificado/retiro')
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(500)
            .end((err, res) => {
                assert.equal(res.status, 500);
                assert(res.body.error);
                assert(queryStub.calledOnce);
                done();
            });
    });
});