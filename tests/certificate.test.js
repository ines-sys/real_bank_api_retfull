const assert = require('assert');
const request = require('supertest');
const app = require("../src/app");
const db = require('../src/database/db_connection');
const sinon = require('sinon'); 

describe('POST /certificado/request', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful Certificate Creation
    it('responde con la información del certificado creado si la consulta a la base de datos es exitosa', (done) => {
        const fakeRequestBody = {
            cliente_id: 1,
            balance: 1000,
            fecha_emision: '2024-01-15',
            fecha_vencimiento: '2025-01-15'
        };

        const fakeCertificate = {
            id: 1,
            cliente_id: fakeRequestBody.cliente_id,
            balance: fakeRequestBody.balance,
            fecha_emision: fakeRequestBody.fecha_emision,
            fecha_vencimiento: fakeRequestBody.fecha_vencimiento
        };

        queryStub.resolves({ rows: [fakeCertificate] });

        request(app)
            .post('/certificado/request')
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.message);
                assert(res.body.body.certificate);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 2: Missing Information in Request Body
    it('responde con 400 si falta alguna información requerida en el cuerpo de la solicitud', (done) => {
        const incompleteRequestBody = {
            cliente_id: 1,
            balance: 1000,
            fecha_emision: '2024-01-15',
        };

        request(app)
            .post('/certificado/request')
            .send(incompleteRequestBody)
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, res) => {
                assert.equal(res.status, 400);
                assert(res.body.error);
                assert(queryStub.notCalled);
                done();
            });
    });

    // Test 3: Error in Database Insertion
    it('responde con 500 si hay un error al insertar el certificado en la base de datos', (done) => {
        const fakeRequestBody = {
            cliente_id: 1,
            balance: 1000,
            fecha_emision: '2024-01-15',
            fecha_vencimiento: '2025-01-15'
        };

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .post('/certificado/request')
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

describe('GET /certificado/list', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with the list of certificates
    it('responde con la lista de certificados si la consulta a la base de datos es exitosa', (done) => {
        const fakeCertificates = [
            { id: 1, cliente_id: 101, balance: 100, fecha_emision: '2024-01-01', fecha_vencimiento: '2024-02-01' },
        ];

        queryStub.resolves({ rows: fakeCertificates });

        request(app)
            .get('/certificado/list')
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(Array.isArray(res.body));
                assert.equal(res.body.length, fakeCertificates.length);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 2: Error response when there is an error getting the list of certificates from the database
    it('responde con 500 si hay un error al obtener la lista de certificados desde la base de datos', (done) => {
        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .get('/certificado/list')
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

describe('GET /certificado/ganancia/:id', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with monthly gains calculated
    it('responde con las ganancias mensuales calculadas si la consulta a la base de datos es exitosa', (done) => {
        const fakeCertificateId = 1;
        const fakeCertificate = {
            balance: 1000,
            fecha_emision: '2023-01-01',
            fecha_vencimiento: '2023-03-01',
        };

        queryStub.resolves({ rows: [fakeCertificate] });

        request(app)
            .get(`/certificado/ganancia/${fakeCertificateId}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.message);
                assert(res.body.body.certificateMonthlyGainList);
                assert(queryStub.calledOnce);
                done();
            });
    });

    // Test 2: Error response when there is an error calculating monthly gains from the database
    it('responde con 500 si hay un error al calcular las ganancias mensuales desde la base de datos', (done) => {
        const fakeCertificateId = 1;

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .get(`/certificado/ganancia/${fakeCertificateId}`)
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

