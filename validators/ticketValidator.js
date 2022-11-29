const {param, body} = require("express-validator");

module.exports.getOneTicketValidator = [
    param('ticketId')
    .isNumeric()
    .withMessage('لطفا شماره تیکت را به صورت صحیح وارد کنید.')
    .toInt()
]