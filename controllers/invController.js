const invModel = require("../models/inventory-model")
const { classifications } = require("../routes/static")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.vehicleDetails = async function (req, res) {
  const invId = req.params.inventoryId;
  const vehicle = await invModel.getVehicleById(invId);

  if (!vehicle) {
        return res.status(404).send("Vehicle not found");
    }

  const nav = await utilities.getNav();
  res.render("inventory/vehicle", { title: `${vehicle.inv_make} ${vehicle.inv_model}`, nav, vehicle });

  /*or
  const htmlContent = utilities.wrapVehicleHTML(vehicle);
  res.send(htmlContent);*/
  }

  invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
  })
}


  invCont.buildAddClassificationView = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/addClassification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }

  invCont.buildAddVehicleView = async function (req, res, next) {
    let nav = await utilities.getNav()
    let classifications = await utilities.getClassificationOptions()  
    res.render("./inventory/addVehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classifications,
    })
  }

  invCont.addNewClassification = async function (req, res) {
    try {
      let nav = await utilities.getNav()
      const { classification_name } = req.body
      console.log(classification_name)
      const newClassAdded = await invModel.addNewClassification(classification_name)
      
      if (newClassAdded) {
        req.flash("notice", `New classification added successfully.`)
        const classifications = await utilities.getClassificationOptions()
        res.status(201).render("./inventory/management", {
          title: "Vehicle Management",
          nav,
          errors: null,
          classifications,
        })
      } else {
        req.flash("notice", "Sorry, adding the new classification failed.")
        res.status(501).render("./inventory/addClassification", {
          title: "Add New Classification",
          nav,
          errors: null,
        })}
      } catch (error) {
        console.error("Error adding new classification:", error)
        req.status(500).send("An error ocurred in the server.")
      }
  }

  invCont.addNewVehicle = async function (req, res) {
    let nav = await utilities.getNav()
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color} = req.body

    const newVehicleAdded = await invModel.addNewVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)

    if (newVehicleAdded) {
      req.flash("notice", `New vehicle added successfully.`)
      const classifications = await utilities.getClassificationOptions()
      res.status(201).render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classifications,
      })
    } else {
      req.flash("notice", "Sorry, adding the new vehicle failed.")
      const classifications = await utilities.getClassificationOptions(classification_id)
      res.status(501).render("./inventory/addVehicle", {
        title: "Add New Vehicle",
        nav,
        errors: null,
        classifications,
    })}}

module.exports = invCont