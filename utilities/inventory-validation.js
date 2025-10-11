const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/* **********************************
 * Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a classification name with at least 3 characters.")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(classification_name)
        if (classificationExists) {
          throw new Error("Classification already exists. Please use a different name.")
        }
      })
  ]
}

/* **********************************
 * Vehicle Data Validation Rules
 * ********************************* */
validate.vehicleRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year."),
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide the vehicle mileage (must be a number)."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 10 })
      .withMessage("Please provide a description with at least 10 characters."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the color."),
    body("classification_id")
      .notEmpty()
      .isInt()
      .withMessage("Please select a valid classification.")
  ]
}

/* ******************************
 * Check Classification Data
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name = '' } = req.body || {}
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inv/addClassification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/* ******************************
 * Check Vehicle Data
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const {
    inv_make = '',
    inv_model = '',
    inv_year = '',
    inv_price = '',
    inv_miles = '',
    inv_description = '',
    inv_image = '',
    inv_thumbnail = '',
    inv_color = '',
    classification_id = ''
  } = req.body || {}

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classifications = await utilities.getClassificationOptions()
    res.render("inv/addVehicle", {
      errors,
      title: "Add New Vehicle",
      nav,
      classifications,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_color,
      classification_id,
    })
    return
  }
  next()
}

module.exports = validate
