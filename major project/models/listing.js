const mongoose = require('mongoose');
const schema=mongoose.Schema;
const listingSchema=new schema({
    title:{
        required:true,
        type:String,
    },
    description:String,
   image: {
       url:String,
       filename:String,

    },
    price:Number,
    location:String,
    country:String,
    lat:Number,  // stores the coordinates of the location
    lng:Number
});
const listing=mongoose.model("listing", listingSchema);
module.exports=listing;
