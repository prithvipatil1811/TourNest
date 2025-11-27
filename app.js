//app.js file : main file where the express app is created and configured....
// mainly used for middleware declaration and route mounting

// const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
//const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

//routes imported from routes folder for better modularity and cleaner code
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); //it will add a bunch of functions from the express library to the app variable
app.set('query parser', 'extended'); //app.set() is an Express application setting, not a middleware function.

//GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet(
  // {crossOriginResourcePolicy: { policy: "cross-origin" }}
   ));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // third-party middleware for logging HTTP requests and errors. 'dev' is a predefined format string that provides concise output colored by response status for development use.
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
//middleware : to parse the incoming JSON data from the request body
app.use(express.json({ limit: '10kb' })); // express.json() is a built-in middleware function in Express. It parses incoming requests with JSON payloads and is based on body-parser.
      //limit: limits the amount of data that comes in the body


// Data sanitization against NoSQL query injection
app.use(mongoSanitize());          //// removes $ and . from req.body, req.query, req.params

// dont use this xss-clean as Express 5 made req.query read-only. xss-clean tries to write to req.query causing error:TypeError: Cannot set property query of #<IncomingMessage> which has only a getter
//now with express5 we need to manually sanitize required routes with main xss package...xss-clean wont work...
// Data sanitization against XSS
//app.use(xss());    //It sanitizes user input (i.e., req.body, req.query, req.params) and removes malicious HTML / JS snippets like:<script>alert("Hacked!")</script>

// Prevent parameter pollution  
//hpp stands for HTTP Parameter Pollution
app.use(hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);




// SERVING STATIC FILES: use built in express middleware:
app.use(express.static(`${__dirname}/public`));

//custom middleware : to log the request time (Test middileware)
app.use((req, res, next) => {
  //console.log('Hello from the middleware 👋');
  req.requestTime = new Date().toISOString(); //.toISOString() method converts a Date object into a readable string format using the ISO standard.
  //console.log(req.headers);
  next(); // to pass the control to the next middleware function in the stack
});

//***keep in mind that middleware are executed in the order they are defined in the code. if the middleware is defined after the route handler, it will not be executed for that route. so define middleware before the route handlers.***

/* basic route example
//create a route : using app.get
app.get('/', (req,res)=>{
    // res.sendStatus(200);
    // res.send('Hello World!');
     res.status(200).json({ message: 'Hello World!', app: 'Natours' });
})

app.post('/', (req,res)=>{
    res.send('You can post to this endpoint...');
});
*/

/* all the routes are moved to seperate files in the routes folder.... leaving this here for just tracking how many changes we actually made in the refactoring process.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//ROUTE HANDLERS
const getAllTours = (req, res) => {
  res.json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: {
      tours, // shorthand for tours: tours
    },
  });
};

const getTour = (req, res) => {
  console.log(req.params); // req.params is an object containing properties mapped to the named route "parameters". For example, if you have the route /user/:name, then the "name" property is available as req.params.name.

  const tour = tours.find((el) => el.id === parseInt(req.params.id));
  //instead of parseInt we can also use + sign to convert string to number or use a trick like: id= req.params.id * 1

  //soln for invalid id
  //if (parseInt(req.params.id) > tours.length){
  //  or we can use !tour
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  // console.log(req.body);
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
    }
  );
};

const updateTour = (req, res) => {
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
};

const deleteTour = (req, res) => {
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

//dummy users ROUTE HANDLERS
const getAllUsers = (req, res) => {
  res.status(500).json({
    //status code 500 means internal server error
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined!',
  });
};
*/

//ROUTES

/* commenting this part to use a more clean way to define routes using app.route ... see below

//create a route : using app.get
app.get('/api/v1/tours', getAllTours);

//create a route :  for route parameters
// to define an optional parameter in a route, you can use a question mark (?) after the parameter name. For example, /api/v1/tours/:id? would make the id parameter optional.
app.get('/api/v1/tours/:id', getTour);

//create a route : using app.post
app.post('/api/v1/tours', createTour);

//create a route : using app.patch
//it is used to update existing data partially
app.patch('/api/v1/tours/:id', updateTour);

//handle delete request : using app.delete
app.delete('/api/v1/tours/:id', deleteTour);

*/
/*
//more clean way to define routes using **app.route()** ... here we can chain different http methods for the same route
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
*/

/* all routes moved....

//ROUTES using express.Router() for better modularity and cleaner code
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/

//MOUNTING THE ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//for routes that are not handled explictly
/* old
app.all('/*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});
*/
//use
app.use((req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });
  // const err = new Error (`Can't find ${req.originalUrl} on this server!`)
  // err.status = 'fail';
  // err.statusCode =400;

// implementing the AppError class from utils
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));       //when we pass any parameter in next() function, node knows there is an error and the execution is passed to the global error handler 
});

// err handling middleware
app.use (
   globalErrorHandler
  /* implemented in errorController.js
  (err, req, res, next)=>{
  console.log(err.stack);
  err.statusCode = err.statusCode ||500;
  err.status=err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message :err.message
  });
}*/
  )

module.exports = app;

/* SERVER FUNCTIONALITY IS MOVED TO SERVER.JS FILE 
//START SERVER : using app.listen
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
*/
