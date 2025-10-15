const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")


  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), 
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists){
      throw new Error("Email exists. Please log in or use different email")
    }}),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname = '', account_lastname = '', account_email = '' } = req.body || {}
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

validate.loginRules = () => {
    return [
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

validate.checkLoginData = async (req, res, next) => {
  const {account_email = '' } = req.body || {}
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
} 

validate.updateAccountRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."),

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),

        // valid email is required and must not exist for a different account
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                const account_id = req.body.account_id;
                const accountData = await accountModel.getAccountEmail(account_email);

                // If no account with this email exists, validation passes
                if (!accountData) {
                    return;
                }

                // If an account exists, check if it belongs to the current user
                if (accountData.account_id !== Number(account_id)) {
                    throw new Error("Email already exists and belongs to another account.");
                }
            }),
    ];
};

/* ****************************************
 * Check data for account update and return errors or continue
 * ************************************ */
validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const title = "Update Account";

        // Re-fetch account data to ensure all fields in the view are populated
        const accountData = await accountModel.getAccountById(account_id);

        res.render("account/updateAccount", {
            title: title,
            nav,
            errors,
            // Pass the data back, prioritizing posted data for "stickiness"
            accountData: {
                account_id: account_id,
                account_firstname: account_firstname,
                account_lastname: account_lastname,
                account_email: account_email,
                account_type: accountData.account_type 
            },
        });
        return;
    }
    next();
};

/* ****************************************
 * New Password Validation Rules
 * ************************************ */
validate.newPasswordRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
 * Check data for password change and return errors or continue
 * ***************************** */
validate.checkNewPasswordData = async (req, res, next) => {
    const account_id = req.body?.account_id;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        const title = "Update Account";
        
        // Refetch account data to populate the forms again (including original names/email)
        const accountData = await accountModel.getAccountById(account_id);

        res.render("account/updateAccount", {
            title: title,
            nav,
            errors,
            accountData: accountData,
        });
        return;
    }
    next();
};

module.exports = validate



