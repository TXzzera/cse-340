const invModel = require("../models/inventory-model")
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

module.exports = invCont