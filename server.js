const express=require("express")
const mongoose = require("mongoose")
const cors=require("cors");
const {MONGO_URI} = require("./keys")
const PORT = 5000
const app=express()


mongoose.connect(MONGO_URI)
mongoose.connection.on("connected",()=>{
    console.log("congrats!!! mongodb connected successfully")
})
mongoose.connection.on("error",(err)=>{
    console.log("sorry mongodb not connected",err)
})
require("./model/user")
require("./model/postmodel")
app.use(express.json())
app.use(cors({
    origin:"http://localhost:3000"
}))
app.use(require("./route/auth"))
app.use(require("./route/post"))
// app.use(require("./route/profile"))

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})