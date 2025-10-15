const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')


router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get("/userAccount", utilities.handleErrors(accountController.buildAccountManagement))
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))
router.get("/logout", utilities.handleErrors(accountController.accountLogout))
router.get("/update/:accountId", utilities.checkJWTToken, utilities.handleErrors(accountController.buildUpdateView));
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
   utilities.handleErrors(accountController.accountLogin)
)
router.post(
  "/update",
  utilities.checkJWTToken,       
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/change-password",
  regValidate.newPasswordRules(),
  regValidate.checkNewPasswordData,
  utilities.handleErrors(accountController.changePassword)
);

module.exports = router;