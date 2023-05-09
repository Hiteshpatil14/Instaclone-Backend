const webtocken =require("jsonwebtoken")


const {JWT_SECRET_TOKEN}=require("../keys")
const mongoose=require("mongoose")
const user =mongoose.model("user")


module.exports=(req,resp,next)=>{
        const {authorization} = req.headers
        if(!authorization){
           return resp.json({error:"you must be in"})
        }
        const token =authorization.replace("Bearer ","")
        webtocken.verify(token,JWT_SECRET_TOKEN,(err,payload)=>{
            if(err){
                console.log(authorization)
               return resp.json({error:"you must be loged in"})
            }
            console.log(payload)
            const {_id}=payload

            user.findById(_id)
            .then(userdetails=>{
                req.user=userdetails
                next()
            })
        })
}