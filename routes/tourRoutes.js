const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');


const router = express.Router(); // just a convention to name it router... so i renamed it to router from tourRouter

//PARAM MIDDLEWARE:
//router.param('id', tourController.checkId);
/*router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
*/

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
  //.post(tourController.checkBody, tourController.createTour); //CHAINING multiple middlewares
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete( authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

module.exports = router;
