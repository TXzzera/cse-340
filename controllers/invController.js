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
  
  let className = data.length > 0 ? data[0].classification_name : "No vehicles"
  
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
}

invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classifications = await invModel.getClassifications() 
    let vehicles = await invModel.getAllVehicles() 

    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classifications: classifications.rows, 
      vehicles: vehicles.rows,               
    })
  } catch (error) {
    next(error)
  }
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
  try {
    const nav = await utilities.getNav();
    let classifications = await utilities.getClassificationOptions();

    if (!Array.isArray(classifications)) {
      classifications = [];
    }

    res.render("inventory/addVehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classifications,
      classification_id: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: ""
    });
  } catch (error) {
    console.error("Error in buildAddVehicleView:", error);
    next(error); 
  }
};

invCont.addNewClassification = async function (req, res) {
  try {
    let nav = await utilities.getNav()
    const { classification_name } = req.body
    const newClassAdded = await invModel.addNewClassification(classification_name)
    
    if (newClassAdded) {
      req.flash("notice", `New classification added successfully.`)
      res.redirect("/inv");
    } else {
      req.flash("notice", "Sorry, adding the new classification failed.")
      res.status(501).render("inventory/addClassification", {
        title: "Add New Classification",
        nav,
        errors: null,
      })
    }
  } catch (error) {
    console.error("Error adding new classification:", error)
    res.status(500).send("An error occurred in the server.")
  }
}

invCont.addNewVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  const newVehicleAdded = await invModel.addNewVehicle(
    inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  )

  if (newVehicleAdded) {
    req.flash("notice", `New vehicle added successfully.`)
    res.redirect("/inv");
  } else {
    req.flash("notice", "Sorry, adding the new vehicle failed.")
    const classifications = await utilities.getClassificationOptions()
    res.status(501).render("inventory/addVehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classifications,
    })
  }
}

invCont.deleteVehicle = async (req, res) => {
  const inv_id = req.body.inv_id;
  try {
    await invModel.deleteVehicle(inv_id);
    req.flash("notice", "Vehicle deleted successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).send("Error deleting vehicle");
  }
};

invCont.deleteClassification = async (req, res) => {
  const classification_id = req.body.classification_id;
  try {
    await invModel.deleteClassification(classification_id);
    req.flash("notice", "Classification deleted successfully.");
    res.redirect("/inv");
  } catch (error) {
    console.error("Error deleting classification:", error);
    res.status(500).send("Error deleting classification");
  }
};

module.exports = invCont
