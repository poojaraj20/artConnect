//imprt mongoose
const mongoose=require('mongoose')
const connectionString=process.env.DATABASE
mongoose.connect(connectionString).then(()=>{
console.log("server connected to mongodb");
    }).catch((err)=>{
console.log("mongobd connection error",err)})
