const express = require('express');

const router=express.Router();

const { signup,login, logout, forgotPassword, forgotPasswordReset, getLoggedInUserDetails, updatePassword } =require('../controllers/userController');
const { isLoggedIn } = require('../middlewares/USER.JS');
const { route } = require('./home');


router.route('/signup').post(signup);
router.route('/login').post(login);
router.route("/logout").post(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(forgotPasswordReset);
router.route("/userdashboard").get(isLoggedIn,getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn,updatePassword);

module.exports=router;
