const options = {
    definition: {
        info: {
            title: 'Real Bank APIs',
            version: '1.0.0',
            description: 'Esta es el RESTful API de Real Bank'
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ['./routes/*.js']
}

module.exports = options;