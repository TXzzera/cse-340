/* ****************************************
*  Deliver login view
* *************************************** */

const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const accountModel = require('../models/account-model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration errored.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/userAccount")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  res.render("account/userAccount", {
    title: "Account Management",
    nav,
    errors: null,
    accountData:accountData
  })
}

async function accountLogout(req, res) {
  res.clearCookie("jwt")  
  res.locals.loggedin = 0
  res.locals.accountData = null    
  req.flash("logoutMsg", "You have been logged out.") 
  res.redirect("/")         
}

async function buildUpdateView(req, res, next) {
    const account_id = parseInt(req.params.accountId) || res.locals.accountData.account_id;
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    if (!accountData) {
        req.flash("notice", "Account not found.");
        return res.redirect("/account/");
    }

    res.render("account/updateAccount", {
        title: "Update Account",
        nav,
        accountData: accountData,
        errors: null,
    });
}

/* ****************************************
 * Process Account Update Request (Name/Email)
 * ************************************ */
async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_id } = req.body;

    const updatedUser = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    );

    if (updatedUser) {
        delete updatedUser.account_password; 
        const accessToken = utilities.createJWT(updatedUser);
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        req.flash("success", "Account information updated successfully.");
        return res.redirect("/account/"); 
    } else {
        req.flash("notice", "Sorry, the account update failed.");
        res.status(501).render("account/updateAccount", {
             title: "Update Account",
             nav,
             accountData: req.body,
             errors: null,
        });
    }
}

async function changePassword(req, res) {
    let nav = await utilities.getNav();
    const { account_password, account_id } = req.body;

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the password change.');
        return res.status(500).redirect("/account/update/" + account_id);
    }

    const updateResult = await accountModel.changePassword(hashedPassword, account_id);

    if (updateResult > 0) {
        const updatedUser = await accountModel.getAccountById(account_id);
        delete updatedUser.account_password;
        const accessToken = utilities.createJWT(updatedUser);
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
        req.flash("success", "Password updated successfully.");
        return res.redirect("/account/");
    } else {
        req.flash("notice", "Sorry, the password change failed.");
        return res.status(501).redirect("/account/");
    }}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accountLogout, buildUpdateView, updateAccount, changePassword }