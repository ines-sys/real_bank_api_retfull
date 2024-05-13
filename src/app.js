const express = require('express');

const basicRoutes = require('./routes/basic.routes');
const clientRoutes = require('./routes/client.routes');
const certificateRoutes = require('./routes/certificate.routes');
const balanceAndDepositRoutes = require('./routes/balance_and_deposit.routes');

// Swagger
const swaggerUI = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDefinition = require('./swagger/swagger.json');

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
};
  
const specs = swaggerJsdoc(options);

const app = express();
app.listen(3000);
console.log("Listing in 3000 port");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use(basicRoutes);
app.use(clientRoutes);
app.use(certificateRoutes);
app.use(balanceAndDepositRoutes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));

module.exports = app;
