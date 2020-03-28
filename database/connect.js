const Sequelize = require('sequelize')

const sequelize = new Sequelize('locas_database', 'restful_api_accounts', '22121223', {
    host: '149.28.145.107',
    dialect: 'postgres',
    port : 5432,
})

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
module.exports = sequelize