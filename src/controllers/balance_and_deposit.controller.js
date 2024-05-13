const db = require('../database/db_connection');
const { formatToDOP, sumTwoValues, subtractTwoValues } = require('../utils');

/**
 * Retrieves and formats the balance of a certificate based on its ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing the formatted balance of the certificate.
 *
 * @example
 * // Assuming the endpoint is "/certificado/balance/:id"
 * app.get('/certificado/balance/:id', getCertificateBalance);
 */
const getCertificateBalance = async (req, res) => {
    try {
        const certificateId = req.params.id;

        const certificateQuery = await db.query('SELECT * FROM certificados WHERE id = $1', [certificateId]);
        const balance = certificateQuery.rows[0].balance;
        const balanceFormat = formatToDOP(balance);
       
        res.json({ 
            message: `El balance del certificado con el id ${ certificateId } es:`,
            body: {
                balanceFormat
            }
        });
    } catch (error) {
        console.error('Error al obtener el balance del certificado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * Retrieves and formats the balances of certificates for a specific client based on their client ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response containing the formatted balances of certificates for the client.
 *
 * @example
 * // Assuming the endpoint is "/certificado/balancecliente/:idcliente"
 * app.get('/certificado/balancecliente/:idcliente', getCertificateBalancePerClient);
 */
const getCertificateBalancePerClient = async (req, res) => {
    try {
        const clientId = req.params.idcliente;

        const certificateQuery = await db.query('SELECT * FROM certificados WHERE cliente_id = $1', [clientId]);
        const balances = certificateQuery.rows.map(certificate => {
            const balanceFormat = formatToDOP(certificate.balance);
            return { certificate_id: certificate.id, balance: balanceFormat };
        })
       
        res.json({ 
            message: `El cliente con el id ${ clientId } posee los siguientes certificados con sus respectivos balances:`,
            body: {
                balances
            }
         });
    } catch (error) {
        console.error('Error al obtener el balance de los certificados para el cliente indicado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * Adds a deposit amount to the balance of a specific certificate.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response confirming the successful deposit and the updated balance of the certificate.
 *
 * @example
 * // Assuming the endpoint is "/certificado/deposito"
 * // A POST request with a JSON body like: { "certificateId": 1, "depositAmount": 500 }
 * app.post('/certificado/deposito', addDepositInCertificate);
 */
const addDepositInCertificate = async (req, res) => {
    try {
        const { certificateId, depositAmount } = req.body;

        const certificateQuery = await db.query('UPDATE certificados SET balance = balance + $1 WHERE id = $2  RETURNING *', [depositAmount, certificateId]);
        const actualBalance = formatToDOP(certificateQuery.rows[0].balance);
        
        res.json({ 
            message: `Su depósito de ${depositAmount} en el certificado con el id ${certificateId} fue realizado exitosamente. El balance actual del certificado es ${actualBalance}`
        });
    } catch (error) {
        console.error('Error al realizar el deposito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * Processes a withdrawal of a specified amount from a certificate, considering penalties if applicable.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} A promise that resolves with the JSON response confirming the successful withdrawal and the updated balance of the certificate.
 *
 * @example
 * // Assuming the endpoint is "/certificado/retiro"
 * // A POST request with a JSON body like: { "certificateId": 1, "amountRetreat": 300 }
 * app.post('/certificado/retiro', withdrawMoneyInCertficate);
 */
const withdrawMoneyInCertficate = async (req, res) => { 
    try {
        const { certificateId, amountRetreat } = req.body 
        const certificadoQuery = await db.query('SELECT fecha_vencimiento, balance FROM certificados WHERE id = $1', [certificateId]);
        const { fecha_vencimiento, balance } = certificadoQuery.rows[0];
        const dateExpiration = new Date(fecha_vencimiento);
        const today = new Date();
        
        let penaltyAmount = 0;
        let estado = 'vencido';

        if (today < dateExpiration) {
            const penaltyMoney = 1000;
            penaltyAmount = sumTwoValues(penaltyMoney, amountRetreat);
            estado = 'penalizado';
        }

        if (penaltyAmount > balance || amountRetreat > balance) {
            let errorMessage = 'El monto a retirar';
            errorMessage += today < dateExpiration ? ' con penalización' : '';
            errorMessage += ' supera la cantidad de saldo en el certificado';
            
            return res.status(400).json({ error: errorMessage });
        }

        const newBalance = subtractTwoValues(balance, today < dateExpiration ? penaltyAmount : amountRetreat);
        await db.query('UPDATE certificados SET balance = $1 WHERE id = $2', [newBalance, certificateId]);

        const formatedNewBalance = formatToDOP(newBalance);

        res.json({
            mensaje: 'Retiro exitoso' + (today < dateExpiration ? ' con penalización' : ''),
            saldo: formatedNewBalance,
            estado: estado 
        });

    } catch (error) {
        console.error('El retiro no puede ser realizado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    getCertificateBalance,
    getCertificateBalancePerClient,
    addDepositInCertificate,
    withdrawMoneyInCertficate
}