require("dotenv").config();
const express = require("express");

const tables = require("./models/tables");
const {db: sequelize} = require("./utils/constants");
const middlewaresRoters = require("./middlewares/mid");
const otherRouters = require('./routes/other')
const mainRouters = require("./routes/main");
const authRouters = require("./routes/auth");


(async function() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        sequelize.sync({logging : false});
        console.log("Database has synced.")
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
})()

const ARC_SITE_KEY = process.env.ARC_SITE_KEY

const app = express();

// public values for all views

app.set('view engine', 'ejs');


app.use(middlewaresRoters);

app.use((request, response, next) => {
  const isAuth = request.session.user ? true : false
  request.isAuth = isAuth
  app.locals = {
    path: request.path,
    isAuth :isAuth,
    current_user: request.session.user,
    ARC_SITE_KEY:ARC_SITE_KEY
  }
  next()
});

app.use(otherRouters);
app.use(mainRouters);
app.use('/account', authRouters);

app.use((req , res , next) => {
  const err = new Error('صفحه مورد نظر پیدا نشد.')
  err.statusCode = 404
  next(err)
}) 

app.use((err, req, res, next) => {
  res.status(err.statusCode)
  .render('error' , {
    msg : err.message,
    status : err.statusCode
  })
})
app.listen(8000);