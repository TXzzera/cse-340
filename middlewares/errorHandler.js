const Util = require('../utilities');
async function errorHandler(err, req, res, next) {
  console.error(err.stack);

 
  let navHTML;
  try {
    navHTML = await Util.getNav(req, res, next);
  } catch (navErr) {
    console.error("Error:", navErr);
    navHTML = '<ul><li><a href="/">Home</a></li></ul>'; 
  }

  res.status(500).render('error', { 
    message: err.message,
    title: '500 Error',
    nav: navHTML
  });
}

module.exports = errorHandler;
