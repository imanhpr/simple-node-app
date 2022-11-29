const tables = require("../models/tables")
const {db} = require('../utils/constants')

db.sync()

tables.Subject.bulkCreate([
    {name : 'انتقاد و پیشنهاد'},
    {name : 'گیم سرور DayZ'},
    {name : 'دیگر ...'}
])

console.log("Datas have created successfuly.")