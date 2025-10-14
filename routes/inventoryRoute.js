// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const validate = require("../utilities/inventory-validation")

// Get Routes
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/vehicle/:inventoryId", invController.vehicleDetails);
router.get("/", utilities.handleErrors(invController.buildManagementView));
router.get("/addClassification", invController.buildAddClassificationView);
router.get("/addVehicle", invController.buildAddVehicleView);
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteConfirmationView));
//Post Routes
router.post(
  "/addClassification",
  validate.classificationRules(),
  validate.checkClassificationData,
  invController.addNewClassification
)

router.post(
  "/addVehicle",
  validate.vehicleRules(),
  validate.checkVehicleData,
  invController.addNewVehicle
)

router.post("/edit-inventory",
    validate.vehicleRules(),
    validate.checkUpdateData,
    utilities.handleErrors(invController.updateVehicle));

router.post("/deleteVehicle",utilities.handleErrors(invController.deleteVehicle));
//router.post("/deleteClassification", utilities.handleErrors(invController.deleteClassification));


module.exports = router;