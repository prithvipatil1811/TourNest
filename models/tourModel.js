const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
//creating a mongoose schema:
/* 
//this is the most basic way of describing a schema...we can also define schema type options for each field

const tourSchema = new mongoose.Schema({
  name : String,
  rating : Number,
  price : Number             
});
*/

const tourSchema = new mongoose.Schema(
  {
    //schema definition
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //required takes an array... first element- true or false, second- error message.
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        //enum validator is only for strings
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation ....so this function is not going to work on update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, //only the file name of the image is stored in the database... i.e. a reference of the image...we can also store the actual image in the database but usually it is not done
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], //array of strings.
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //schema options
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// virtual properties:
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // pre-save hook (the function inside pre is called before saving the document)
  this.slug = slugify(this.name, { lower: true });
  next();
  // console.log(this)
});
/*
// we can have multiple pre and post middlewares
tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/
// QUERY MIDDLEWARE
//tourSchema.pre('find', function(next) {  //doesnt work for findOne
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //unshift() adds element at the begining of the array.
  //here in aggregation middleware, this points to the current aggregation object.

  console.log(this.pipeline());
  next();
});

//creating a model out of schema:
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//all operations done in tour controller file....

/*
//creating a document out of model: (just testing)
const testTour= new Tour({
    name : 'The Park Camper',
    // rating: 4.0,
    price : 2000
});
testTour.save().then(doc => console.log(doc)).catch(err => console.log ('ERROR: ' , err));
*/
