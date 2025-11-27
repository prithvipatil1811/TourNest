class APIFeatures{
  constructor(query, queryString){
    this.query = query;
    this.queryString = queryString;
  }
  filter(){
    //1)FILTERING
    const queryObj = {...this.queryString};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // console.log(req.query, queryObj);
    //const query =  Tour.find(queryObj);

    //2) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`)
    //console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    //let query =  Tour.find(JSON.parse(queryStr));
    
        /*another method to query database using mongoose special functions:
        const query = await Tours.find().where('duration').equals(5).where('difficulty').equals('easy');
        */
    return this;
  }
  sort(){
     if(this.queryString.sort){
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy)
      this.query = this.query.sort(sortBy)
    }else{
      this.query = this.query.sort('-createdAt')
    }
    return this;
  }
  limitFields(){
     if(this.queryString.fields){
      const fields = this.queryString.fields.split(',').join(' ');
      console.log(fields)
      this.query = this.query.select(fields) //select is used to include only desired fields
    }else{
      this.query = this.query.select('-__v') // - means exclude
    }
    return this;
  }
  paginate(){
    const page = this.queryString.page*1 || 1;
    const limit = this.queryString.limit * 1 ||100;
    const skip = (page -1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    //if users specifies page which will exhaust the available data (i.e. skip more documents than we actually have):
    // if (this.queryString.page){
    //   const numTours = await Tour.countDocuments();
    //   if(skip>=numTours) throw new Error('Page doesnt exist');   // throw will pass the execution to the catch block immediately.
    // }
    return this;
  }
}

module.exports = APIFeatures;