if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const mongoose=require("mongoose");
const express=require("express");
const listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const app=express();
const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
//
const multer  = require('multer')
const {storage}=require("./cloudConfig.js");
const upload = multer({ storage })
// const upload = multer({ dest: 'uploads/' })
main().then(()=>{
    console.log("Connection Successful !");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
app.listen(8080,()=>{
    console.log("server is listening");
});
//home page 
app.get("/listing",async(req,res)=>{
    const alllists=await listing.find({});
    res.render("listings/index.ejs",{alllists});
});
//Form for new list
app.get("/listing/new",(req,res)=>{
    res.render("listings/new.ejs");
});
//Open particular list
app.get("/listing/:id",async(req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
    res.render("listings/show.ejs",{list});
});
//Add new list to home page
// app.post("/listing",async(req,res)=>{
//     let newlisting=new listing(req.body.list);
//     await newlisting.save();
//     res.redirect("/listing");
// });
app.post("/listing",upload.single('list[image]'),
async (req, res) => {
    try {
        // Extract text data
        const { title, description, price, country, location } = req.body.list;

        // 1. Fetch Coordinates (Nominatim)
        const searchQuery = encodeURIComponent(`${location}, ${country}`);
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`;

        const response = await fetch(geocodeUrl, {
            headers: { 'User-Agent': 'CollegeListingProject/1.0' }
        });
        const geoData = await response.json();

        let lat = 0;
        let lng = 0;
        if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
        }

        // 2. Extract Cloud Image Data
        let url = "";
        let filename = "";
        if (req.file) {
            url = req.file.path; // Your Cloudinary URL
            filename = req.file.filename;
        }

        // 3. Save to MongoDB
        const newlisting = new listing({
            title,
            description,
            price,
            location,
            country,
            image: { url, filename },
            lat,
            lng
        });

        await newlisting.save();
        res.redirect(`/listing/${newlisting._id}`);

    } catch (error) {
        console.error("Listing Error:", error);
        res.status(500).send("Error creating listing");
    }
}
)
//Edit Form
// app.get("/listing/:id/edit",async(req,res)=>{
//     let {id}=req.params;
//     const list=await listing.findById(id);
//     res.render("listings/edit.ejs",{list});
// });
// app.put("/listing/:id", upload.single('list[image]'), async (req, res) => {
//     let { id } = req.params;
//     let updateData = { ...req.body.list };

//     if (req.file) {
//         updateData.image = { url: req.file.path, filename: req.file.filename };
//     }

//     await listing.findByIdAndUpdate(id, updateData, { runValidators: true });
//     res.redirect(`/listing/${id}`);
// });
// //Update the list
// app.put("/listing/:id/edit",async(req,res)=>{
//     let {id}=req.params;
//     await listing.findByIdAndUpdate(id, {...req.body.list});
//     res.redirect(`/listing/${id}`);
// });
// //Delete list
// app.delete("/listing/:id",async(req,res)=>{
//     let {id}=req.params;
//     await listing.findByIdAndDelete(id);
//     res.redirect("/listing");
// });
//Open particular list
app.get("/listing/:id",async(req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
    res.render("listings/show.ejs",{list});
});

// ... POST route stays the same ...

//Edit Form
app.get("/listing/:id/edit", async(req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
    res.render("listings/edit.ejs",{list});
});

//Update the list
app.put("/listing/:id", upload.single('list[image]'), async (req, res) => {
    let { id } = req.params;
    let updateData = { ...req.body.list };

    if (req.file) {
        updateData.image = { url: req.file.path, filename: req.file.filename };
    } else {
        delete updateData.image;
    }

    await listing.findByIdAndUpdate(id, updateData, { runValidators: true });
    res.redirect(`/listing/${id}`);
});

//Delete list
app.delete("/listing/:id",async(req,res)=>{
    let {id}=req.params;
    await listing.findByIdAndDelete(id);
    res.redirect("/listing");
});
// app.get("/testlistening",async(req,res)=>{
// let sampletesting=new listing({
//     title:"my villa",
//     decreption:"by the beach",
//     price:1200,
//     location:"Goa",
//     country:"India",
// });
// await sampletesting.save();
// req.send("saved successfully!");
// })
app.get("/",(req,res)=>{
    res.send("Working");
});