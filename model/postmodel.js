const mongoose =require("mongoose")
const {ObjectId}=mongoose.Schema.Types

const Postschema=new mongoose.Schema({
    
    body:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    likes:{
        type:Number
    },
    likedby:[],
    commentby:[{
        comment:String,
        name:String,
        ud:String
    }],
    postedBy:{
        type:ObjectId,
        ref:"user"
    }
})

module.exports=mongoose.model("Post",Postschema)