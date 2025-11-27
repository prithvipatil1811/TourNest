module.exports = fn => {
  return (req, res, next) => {   //this is the anonymous funtion
    fn(req, res, next).catch(next);   // this funtion will call the fn we pass as a parameter to the catchAsync(...) and execute all the code in that fn passes as the parameter.
    //as the parameter fn we pass is an async fn.... if the promise is rejected, we can handel it by catch()
  };
};

/*
//here this catchAsync is a function that takes a function (fn) as an argument....it returns a new anonymous funtion which will be assigned to the export function (eg. createTour) 

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

*/