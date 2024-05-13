const assert = require('assert');
const request = require('supertest');
const app = require("../src/app");
const db = require('../src/database/db_connection');
const sinon = require('sinon'); 

describe('POST /cliente/created', () => {
    // Test 1: Successful creation
    it('responde con 200 y el usuario creado', (done) => {
        const data = {
            nombre: 'John',
            apellido: 'Doe',
        };
    
        request(app)
            .post('/cliente/created')
            .send(data)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect((res) => {
    
            if (res.body.message !== 'El usuario fue creado') {
                throw new Error('Mensaje incorrecto en la respuesta');
            }
    
            if (!res.body.body || !res.body.body.cliente || !res.body.body.cliente.nombre || !res.body.body.cliente.apellido) {
                throw new Error('Estructura incorrecta en la respuesta');
            }
            })
            .end(done);
    });
  
    // Test 2: Incorrect request
    it('responde con 500 en caso de solicitud incorrecta', (done) => {
        // (no name or last name)
        const data = {};
    
        request(app)
            .post('/cliente/created')
            .send(data)
            .set('Accept', 'application/json')
            .expect(400)
            .expect((res) => {
            if (res.body.error !== 'Se requieren tanto el nombre como el apellido para crear un cliente.') {
                throw new Error('Mensaje de error incorrecto en la respuesta');
            }
            })
            .end(done);
    });
});

describe('GET /cliente/list', () => {
    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with the list of clients
    it('responde con 200 y la lista de clientes', (done) => {
        request(app)
            .get('/cliente/list')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                if (!Array.isArray(res.body)) {
                    return done(new Error('La respuesta no es un arreglo'));
                }

                res.body.forEach((cliente) => {
                    if (!cliente.nombre || !cliente.apellido) {
                        return done(new Error('Estructura incorrecta en la respuesta'));
                    }
                });

                done();
            });
    });

    // Test 2: Server error response
    it('responde con 500 en caso de error en el servidor', (done) => {
        const dbQueryStub = sinon.stub(db, 'query').rejects(new Error('Error simulado'));

        request(app)
            .get('/cliente/list')
            .expect('Content-Type', /json/)
            .expect(500)
            .end((err) => {
                if (err) return done(err);
                sinon.assert.calledOnce(dbQueryStub);
                done();
            });
    });
});

describe('PATCH /cliente/update/:id', () => {
    let queryStub;

    beforeEach(() => {
        queryStub = sinon.stub(db, 'query');
    });

    afterEach(() => {
        sinon.restore();
    });

    // Test 1: Successful response with updated client information
    it('responde con la información actualizada del cliente si la consulta a la base de datos es exitosa', (done) => {
        const fakeClientId = 1;
        const fakeRequestBody = { nombre: 'John', apellido: 'Doe' };
        const fakeUpdatedClient = { id: fakeClientId, nombre: 'John', apellido: 'Doe' };

        queryStub.resolves({ rows: [fakeUpdatedClient] });

        request(app)
            .patch(`/cliente/update/${fakeClientId}`)
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert(res.body.message);
                assert(res.body.body.cliente);

                // Verifica que la función db.query fue llamada
                assert(queryStub.calledOnce);

                done();
            });
    });

    // Test 2: Error response when no values are provided for updating the client with the given id
    it('responde con 500 si no hay ningún valor para actualizar al cliente con el id proporcionado', (done) => {
        const fakeClientId = 1;
        const fakeRequestBody = {}; 

        request(app)
            .patch(`/cliente/update/${fakeClientId}`)
            .send(fakeRequestBody)
            .set('Accept', 'application/json')
            .expect(500)
            .end((err, res) => {
                assert.equal(res.status, 500);
                assert(res.body.error);
                assert(queryStub.notCalled);
                done();
            });
    });

    // Test 3: Error response when there is an error updating the client in the database
    it('responde con 500 si hay un error al actualizar el cliente en la base de datos', (done) => {
        const fakeClientId = 1;
        const fakeRequestBody = { nombre: 'John', apellido: 'Doe' };

        queryStub.rejects(new Error('Error en la base de datos'));

        request(app)
            .patch(`/cliente/update/${fakeClientId}`)
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
