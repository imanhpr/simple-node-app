const {
    DataTypes
} = require("sequelize");

const {db} = require('../utils/constants');

const User = db.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_phone_active : {
        type : DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false,
    },
    send_news : {
        type : DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue : false,
    },
    rank : {
        type : DataTypes.ENUM,
        values : ['admin' , 'normal' , 'vip'],
        allowNull : false,
        defaultValue : 'normal'
    }
}, {
    updatedAt: false
})

module.exports = User;