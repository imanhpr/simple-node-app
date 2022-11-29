const express = require("express");
const router = express.Router();

router.get("/about", (req , res) => {
    res.render('about')
});
router.get('/rules' , (req , res) => {
    res.render('rules')
})
router.get('/dayz' , (req , res) => {
    res.render('dayz')
})
module.exports = router;