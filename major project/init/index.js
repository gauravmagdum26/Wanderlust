const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");
const initdb=async()=>{
await listing.deleteMany({});
await listing.insertMany(initData.data);
}
main().then(async()=>{
    console.log("Connection Successful !");
    await initdb();
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
