const express = require('express');

const csrf = require('../utils/csrfMaker')
const authControllers = require("../controllers/auth-c");
const authValidator = require('../validators/authValidators');
const protection = require('../utils/routeProtection');
const profileController = require('../controllers/profile-c');
const {arcCaptchaValidator} = require('../validators/captcha')
const { getOneTicketValidator } = require('../validators/ticketValidator')

const router = express.Router();


router.get('/login', protection.isNotAuth , csrf.setToken ,authControllers.getLogin);
router.post("/login", protection.isNotAuth,arcCaptchaValidator, csrf.validateToken ,authValidator.loginValidator , authControllers.postLogin);

router.get('/register', protection.isNotAuth , csrf.setToken ,authControllers.getRegister);
router.post("/register",protection.isNotAuth ,arcCaptchaValidator , csrf.validateToken ,authValidator.registerValidator,authControllers.postRegister);

router.get('/logout' , protection.isAuth ,authControllers.getLogout);

router.get('/profile' , protection.isAuth, csrf.setToken ,profileController.getProfile)
router.post('/profile' , protection.isAuth ,csrf.validateToken, authValidator.forgetValidator ,profileController.postProfile)

router.post('/profile/change_password' , protection.isAuth ,csrf.validateToken , authValidator.passwordValidator , profileController.changePassword)

router.get('/profile/new-ticket' , protection.isAuth , csrf.setToken , profileController.getSendTicket)
router.post('/profile/new-ticket' , protection.isAuth, csrf.validateToken, profileController.postSendTicket)

router.get('/profile/ticket-list' , protection.isAuth ,profileController.getTicketList)

router.get('/profile/ticket/:ticketId',protection.isAuth,csrf.setToken,getOneTicketValidator ,profileController.getTicket)
router.post('/profile/ticket/:ticketId',protection.isAuth,csrf.validateToken,getOneTicketValidator , profileController.postTicketComments)
router.post('/profile/ticket/close/:ticketId',protection.isAuth,getOneTicketValidator , profileController.postCloseTicket)

router.get('/active' , protection.isNotAuth, csrf.setToken , authControllers.getPhoneActive)
router.post('/active' , protection.isNotAuth , csrf.validateToken , authControllers.postPhoneActive)

router.post('/resend' , protection.isNotAuth , authControllers.postResendSms)

router.get('/forgetpass' , protection.isNotAuth , authControllers.getForgetPassword)

router.post('/forgetpass' , protection.isNotAuth,arcCaptchaValidator ,authValidator.forgetValidator , authControllers.postForgetPassword)
module.exports = router;