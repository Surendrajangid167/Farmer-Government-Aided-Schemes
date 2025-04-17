const mongoose = require("mongoose");

const DB = "mongodb+srv://surendrajangid167:Shiv#167@cluster0.99idr.mongodb.net/AGROWEBAPP?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(DB,{
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => console.log("Database Connected")).catch((errr)=>{
    console.log(errr);
})