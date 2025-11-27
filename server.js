// in server.js file there is stuff that is not related to express, but still related to our application....
// so the stuff like database Configurations, error handling stuff, environment variables, etc will be in server.js file.

const mongoose = require('mongoose');
const dotenv = require('dotenv');

//HANDLING UNCAUGHT EXCEPTIONS
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, //mongoose.connect() returns a PROMISE..... it also gets access to a connection object
   /*{                 
depreceated since mongoose 6.           now just use mongoose.connect(DB).then().catch()
  useNewUrlParser: true,
  useCreateIndex : true,
  useFindAndModify: false
}*/).then(con=>{
  // console.log(con.connections);
  console.log('DB connection successful');

})//.catch(err => console.log("ERROR"))





//console.log(process.env)  //environment variables set by nodejs

console.log(app.get('env')); //environment variable set by express
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`\nServer is listening on port ${port}`);
});

//HANDLING ERRORS OUTSIDE EXPRESS : UNHANDLED PROMISE REJECTIONS
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
