const User = require('./User');

const { Ticket , TicketComment , Subject } = require('./Ticket');

User.hasMany(Ticket);
Subject.hasMany(Ticket);
Ticket.belongsTo(Subject);

User.hasMany(TicketComment);
Ticket.hasMany(TicketComment);
TicketComment.belongsTo(Ticket);
TicketComment.belongsTo(User);

module.exports = {
    User,
    Subject,
    Ticket,
    TicketComment,
}