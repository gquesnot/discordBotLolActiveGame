const Sequelize = require("sequelize");

const db = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'database.sqlite',
    });

const Summoner = db.define('summoner', {
        discordId: {
            type: Sequelize.STRING,
            unique: true,
        },
        summonerName: {
            type: Sequelize.STRING,
            unique: true,
        },
        region: {
            type: Sequelize.STRING
        }
    });


module.exports = {
    db: db,
    Summoner: Summoner
}