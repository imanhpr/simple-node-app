const { Sequelize } = require("sequelize");

const DB_USER = process.env.DATABASE_USER ?? 'postgres'
const DB_PASSWORD = process.env.DATABASE_PASSWORD
if (!DB_PASSWORD) throw Error('Database Password is Null')
module.exports.db = new Sequelize(
    'ninjagamerdb' , DB_USER , DB_PASSWORD,
    {
        host: 'maindb',
        dialect : 'postgres',
    }
)

const FORGET_SET = new Set

module.exports.ACTIVATE_MAP = new Map;

module.exports.FORGET_SET = FORGET_SET