const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')


router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/userAccount", utilities.handleErrors(accountController.buildAccountManagement))
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
router.post(
  "/login",
   regValidate.loginRules(),
   regValidate.checkLoginData,
   utilities.handleErrors(accountController.loginAccount)
)

module.exports = router;