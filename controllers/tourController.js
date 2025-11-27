// const fs = require('fs');

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/* reading data from json file (no longer needed as we now have a database to play with)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);
*/

/*  no longer needed as ids are comming from mongodb and invalid id will throw an mongodb error now
//soln for INVALID ID using  PARAM MIDDLEWARE.
exports.checkId = (req, res, next, val) => {
  console.log(`this is the tour ${val}`);
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
  };

  //middleware to check if the tour added by post method is valid.... by checking the request body
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'missing name or price',
    });
  }
  next();
};
  */
/* not implemented bcoz req.query is no longer mutable and so it needs to be implemented differently
exports.aliasTopTours = (req, res, next) => {
  //pre-filling the query string for a frequetly visited route...so the user doesnt have to do it on his own in the url
  req.query={
    ...req.query,
    limit : '5',
    sort :'-ratingsAverage,price',
    fields : 'name,price,ratingsAverage,summary,difficulty'
  };
    console.log('aliasTopTours - req.query:', req.query); 
  next();
};
*/



exports.getAllTours = catchAsync(async (req, res, next) => {
    //console.log('getAllTours - req.query at entry:', req.query);
    //BUILD QUERY
    //no longer needed as we have moved this logic to apiFeatures.js file
    /*
    //1)FILTERING
    const queryObj = {...req.query};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // console.log(req.query, queryObj);
    //const query =  Tour.find(queryObj);

    //2) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`)
    //console.log(JSON.parse(queryStr));

    let query =  Tour.find(JSON.parse(queryStr));
    
        another method to query database using mongoose special functions:
        const query = await Tours.find().where('duration').equals(5).where('difficulty').equals('easy');
        

    //3)SORTING
    //console.log(req.query)
    if(req.query.sort){
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy)
      query = query.sort(sortBy)
    }else{
      query= query.sort('-createdAt')
    }

    //4)FIELD LIMITING
    if(req.query.fields){
      const fields = req.query.fields.split(',').join(' ');
      console.log(fields)
      query = query.select(fields) //select is used to include only desired fields
    }else{
      query= query.select('-__v') // - means exclude
    }

    //5) PAGINATION :
    const page = req.query.page*1 || 1;
    const limit = req.query.limit * 1 ||100;
    const skip = (page -1) * limit;

    query = query.skip(skip).limit(limit);

    //if users specifies page which will exhaust the available data (i.e. skip more documents than we actually have):
    if (req.query.page){
      const numTours = await Tour.countDocuments();
      if(skip>=numTours) throw new Error('Page doesnt exist');   // throw will pass the execution to the catch block immediately.
    }
    */
   //EXECUTE QUERY
   const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours, // shorthand for tours: tours
      },
    });
  });

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  })
  /* removed try catch as to handle errors more efficiently (global error handling) and implemented catchAsync to handle async fn errors
   now try catch blocks will be removed from all the async fns and createAsync will be used everywhere.

  try {
    // const newTour = new Tour({})
    // newTour.save().then()
    // Instead of this use : Tour.create({}) directly
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
})
  */
// console.log(req.body);
/*
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
               res.status(201).json({
          status: 'success',
          data: {
            tour: newTour,
          },
        });
      },
      
          );
        };
      */

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    //same as Tour.findOne({_id: req.params.id})

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
  }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });

  //console.log(req.params); // req.params is an object containing properties mapped to the named route "parameters". For example, if you have the route /user/:name, then the "name" property is available as req.params.name.
  // const tour = tours.find((el) => el.id === parseInt(req.params.id));
  //instead of parseInt we can also use + sign to convert string to number or use a trick like: id= req.params.id * 1

  //soln for invalid id
  //if (parseInt(req.params.id) > tours.length){
  //  or we can use !tour
  //   if (!tour) {
  //     return res.status(404).json({
  //       status: 'fail',
  //       message: 'Invalid ID',
  //     });
  //   }
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
});

exports.updateTour = catchAsync(async(req, res, next) => {
   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

     if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
  }
    res.status(200).json({
    status: 'success',
    data: {
      tour 
    },
  });
  /*
    if (parseInt(req.params.id) > tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here... Not yet implemented because it is a demo and we are not using a database>',
    },
  });
  */
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

     if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
  }

      res.status(204).json({
      //status code 204 means no content
      status: 'success',
      data: null,
    });
});
/*
    if (parseInt(req.params.id) > tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }
  res.status(204).json({
    //status code 204 means no content
    status: 'success',
    data: null,
  });
};
*/

//aggregation pipeline

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } } //usually we use $match at the start of the pipeline... it is a preliminary filtering stage
      },
      {
        $group: {   // allows us to group documents together using accumulator functions
          _id: { $toUpper: '$difficulty' },   //it is like GROUP BY in SQL... here we are grouping by difficulty field..it is mandatory to have _id field in $group stage
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      //we can have multiple stages like $match, $group, $sort, $limit, $project, etc in a pipeline..i.e. repeat stages
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
});

//how many tours start in a given month of a given year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'  //deconstructs an array field from the input documents to output a document for each element of the array
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12  //limits the output documents to the specified number
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
});