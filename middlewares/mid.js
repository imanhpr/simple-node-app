const path = require("path");

const express = require("express");
const session = require("express-session");
const flash = require('connect-flash');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const router = express.Router()
const STATIC_DIR = path.join(process.cwd(), 'public')
const { db } = require('../utils/constants')
const SECRET_KEY = process.env.SECRET_KEY
// static middleware
router.use('/static', express.static(STATIC_DIR));

router.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store : new SequelizeStore({
        db:db
    })
}))

router.use(flash());

router.use(express.urlencoded({
    extended: false
}));

module.exports = router;