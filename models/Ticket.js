const {
    DataTypes
} = require('sequelize');
const {db} = require('../utils/constants');

const Subject = db.define('Subject', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement : true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
} , {updatedAt : false})

const Ticket = db.define("Ticket", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement : true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state : {
        type: DataTypes.ENUM,
        values : [
            'در انتظار پاسخ',
            'در حال برسی',
            'پاسخ ادمین',
            'پاسخ کاربر',
            'بسته شده',
        ],
        defaultValue : 'در انتظار پاسخ'
    }
}, {
    updatedAt: false
})

const TicketComment = db.define("TicketComment", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement : true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
} , {
    updatedAt: false
})


TicketComment.addHook('beforeCreate' , (instance , options) => {
    return Promise.all([instance.getTicket() , instance.getUser()])
    .then(([ticket , user]) => {
        if (user.rank === 'normal' || user.rank === 'vip') {
            ticket.state = 'پاسخ کاربر';
        } else {
            ticket.state = 'پاسخ ادمین';
        }
        ticket.save()
    })
})
module.exports = {
    Ticket , TicketComment , Subject
}