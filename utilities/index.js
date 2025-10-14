const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require('jsonwebtoken')
require('dotenv').config()

Util.buildClassificationGrid = function(data){
  let grid;
  if(data.length > 0){
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => { 
      grid += '<li>';
      grid += '<a href="/inv/vehicle/'+ vehicle.inv_id 
           + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
           + ' details"><img src="' + vehicle.inv_thumbnail 
           +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
           +' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += '<a href="/inv/vehicle/' + vehicle.inv_id +'" title="View ' 
           + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
           + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' 
           + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.wrapVehicleHTML = function(vehicle) {
  return `
  <html>
    <head>
      <title>${vehicle.inv_make} ${vehicle.inv_model}</title>
      <link rel="stylesheet" href="/css/styles.css" />
    </head>
    <body>
      <div class="vehicle-details">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        <div class = "vehicle-info">
          <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
          <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
          <p>Description: ${vehicle.inv_description}</p>
        </div>
      </div>
    </body>
  </html>
  `}

  Util.handleErrors = function (fn) {
  return async function (req, res, next) {
    try {
      await fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

Util.classificationOptions = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";

    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"${
        classification_id == row.classification_id ? " selected" : ""
      }>${row.classification_name}</option>`;
    });

    classificationList += "</select>";
    console.log("Classification Id:", classification_id);
    return classificationList;
  } catch (error) {
    console.error("Error building classification list:", error);
    return "<select><option>Error loading classifications</option></select>";
  }
};


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util