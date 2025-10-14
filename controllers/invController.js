const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * *************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();

  let className = data.length > 0 ? data[0].classification_name : "No vehicles";

  res.render("inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};

/* ***************************
 *  Build individual vehicle view
 * *************************** */
invCont.vehicleDetails = async function (req, res) {
  const invId = req.params.inventoryId;
  const vehicle = await invModel.getVehicleById(invId);

  if (!vehicle) {
    return res.status(404).send("Vehicle not found");
  }

  const nav = await utilities.getNav();
  res.render("inventory/vehicle", { 
    title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
    nav, 
    vehicle 
  });
};

/* ***************************
 *  Management view
 * *************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = await utilities.classificationOptions(); 
    const vehicles = await invModel.getAllVehicles();

    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classifications,
      vehicles: vehicles.rows,
    });
  } catch (error) {
    console.error("Error building management view:", error);
    next(error);
  }
};

/* ***************************
 *  Add classification view
 * *************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("inventory/addClassification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Add vehicle view
 * *************************** */
invCont.buildAddVehicleView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = await utilities.classificationOptions();

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
      inv_color: "",
    });
  } catch (error) {
    console.error("Error in buildAddVehicleView:", error);
    next(error);
  }
};

/* ***************************
 *  Add new classification
 * *************************** */
invCont.addNewClassification = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    const { classification_name } = req.body;

    const newClassAdded = await invModel.addNewClassification(classification_name);

    if (newClassAdded) {
      req.flash("notice", "New classification added successfully.");
      res.redirect("/inv");
    } else {
      req.flash("notice", "Sorry, adding the new classification failed.");
      res.status(501).render("inventory/addClassification", {
        title: "Add New Classification",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error adding new classification:", error);
    res.status(500).send("An error occurred on the server.");
  }
};

/* ***************************
 *  Add new vehicle
 * *************************** */
invCont.addNewVehicle = async function (req, res) {
  const nav = await utilities.getNav();
  const { 
    inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id 
  } = req.body;

  const newVehicleAdded = await invModel.addNewVehicle(
    inv_make, inv_model, inv_year, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
  );

  if (newVehicleAdded) {
    req.flash("notice", "New vehicle added successfully.");
    res.redirect("/inv");
  } else {
    req.flash("notice", "Sorry, adding the new vehicle failed.");
    const classifications = await utilities.classificationOptions();
    res.status(501).render("inventory/addVehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classifications,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * *************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classifications = await utilities.classificationOptions(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classifications,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateVehicle(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classifications = await utilities.classificationOptions(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classifications,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build Delete Confirmation View - GET Action (confirmation)
 * ************************** */
invCont.buildDeleteConfirmationView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
        req.flash("notice", "Vehicle not found.");
        return res.redirect("/inv/");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/deleteVehicle", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id,
    });
};

/* ***************************
 *  Delete vehicle
 * *************************** */
invCont.deleteVehicle = async function (req, res, next) {
    let nav = await utilities.getNav();
    const inv_id = parseInt(req.body.inv_id);
    const {inv_make, inv_model, inv_price, inv_year, classification_id } = req.body;

    try {
        const deleteResults = await invModel.deleteVehicle(inv_id,);

        if (deleteResults > 0) {
            req.flash("notice", `Succesfully deleted.`);
            res.redirect("/inv/");
        } else {
            const itemData = await invModel.getVehicleById(inv_id);
            const itemName = `${inv_make} ${inv_model}`;
            req.flash("notice", "Sorry, the deletion failed.");
            return res.status(501).render("./inventory/deleteVehicle", {
                title: "Delete " + itemName,
                nav,
                errors: null,
                inv_id: itemData.inv_id,
                inv_make: itemData.inv_make,
                inv_model: itemData.inv_model,
                inv_price: itemData.inv_price,
                inv_year: itemData.inv_year,
                inv_description: itemData.inv_description,
                classification_id: itemData.classification_id,
            });
        }
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        req.flash("notice", "An error occurred while trying to delete.");
        res.redirect("/inv/");
    }
};

/* ***************************
 *  Delete classification
 * *************************** */
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

module.exports = invCont;
