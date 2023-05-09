const { request } = require("express")
const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const tokenvarify = require("../middleware/tokenvalidate")
const Post = mongoose.model("Post")
const User = mongoose.model("user")



router.get("/allpost", tokenvarify, (req, resp) => {

    Post.find()
        .populate("postedBy", "name _id")
        .then(result => {
            resp.json(result)
        })
        .catch(err => {
            console.log(err)
        })
})
// 
router.post("/addpost", tokenvarify, (req, resp) => {
    // console.log(req.body)
    const { title, body, img } = req.body
    if ( !body || !img) {
        return resp.json({ error: "plz enter all post details" })
    }

    req.user.password = undefined
    const data = new Post({
        body,
        photo: img,
        likes:0,
        postedBy: req.user
    })

    data.save()
        .then(saved => {
            resp.json({ saved })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get("/mypost", tokenvarify, (req, resp) => {
    User.findById({_id:req.user.id})
    .then(data=>{
        Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .then(result => {
            resp.json({ result,data })
        })
        .catch(err => {
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
    

})

router.put("/like", tokenvarify,  (req, resp) => {
    console.log(req.body)
    const data=Post.findById({_id:req.body.postid})
    .then(res=>{
        if(res.likedby.includes(req.user._id)){
            return resp.json(res)
        }
        else{
    
    Post.updateOne({_id:req.body.postid},{
        $inc:{likes:1},
        $push:{likedby:req.user._id}
    })
    .then(res=>{
        const data=Post.findById({_id:req.body.postid})
        .then(res=>{
            resp.json(res)
        })
    .then(resp)
        // resp.json(resp)
        console.log(resp)
    })
    .catch(err=>{
        console.log(err)
    })
        }
    })
    .catch(err=>{
        console.log(err)
    })

})
router.put("/unlike", tokenvarify,  (req, resp) => {
    //  console.log(req.body)
    const data=Post.findById({_id:req.body.postid})
    .then(res=>{
        if(!(res.likedby.includes(req.user._id))){
            return resp.json(res)
        }
        else{
    
    Post.updateOne({_id:req.body.postid},{
        $inc:{likes:-1},
        $pull:{likedby:req.user._id}
        
    })
    .then(res=>{
        const data=Post.findById({_id:req.body.postid})
        .then(res=>{
            resp.json(res)
        })
    .then(resp)
        // resp.json(resp)
        console.log(resp)
    })
    .catch(err=>{
        console.log(err)
    }) 
}
    })
    .catch(err=>{
        console.log(err)
    })

})

router.put("/comment",tokenvarify,(req,resp)=>{
    
    Post.updateOne({_id:req.body.commentid},{
        $push:{commentby:{comment:req.body.comment,
            name:req.user.name,
            ud:req.user._id
        }}    
},
{
    new:true
})
    .then(res=>{
        const data=Post.findById({_id:req.body.commentid})
        .then(res=>{
            resp.json(res)
        })
    .then(resp)
        // resp.json(resp)
        console.log(resp)
    })
    .catch(err=>{
        console.log(err)
    })
})
router.put("/deletecomment",(req,resp)=>{
    
    Post.updateOne({_id:req.body.commentid},{
        $pull:{commentby:{_id:req.body.id
        }}    
},
{
    new:true
})
    .then(res=>{
        Post.findById({_id:req.body.commentid})
        .then(res=>{
            resp.json(res)
            
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
})


router.post("/searchuser",(req,resp)=>{
    const data=new RegExp("^"+req.body.text)
    console.log(data)
    User.find({email:{$regex:data}})
    .select("email _id")
    .then(res=>{
        resp.json({res})
    })
    .catch(err=>
        console.log(err))
})

router.post("/searchprofile",(req,resp)=>{
 
    User.findById({_id:req.body.userid.id})
    .then(result=>{
     Post.find({postedBy:req.body.userid.id})
     .then((res=>{
        // console.log(result,res)
       return resp.json({result,res})
     }))
     .catch(err=>{
        console.log(err)
     })
    })
    .catch(err=>{
        console.log(err)
    })
})

router.delete("/deletpost/:id",(req,resp)=>{
     Post.deleteOne({_id:req.params.id})
     .then(res=>{
        resp.json(res)
     })
     .catch(err=>{
        console.log(err)
     })
})

router.put("/follow",tokenvarify,(req,resp)=>{
        User.findByIdAndUpdate(req.body.id,{
            $push:{followers:req.user._id}
        },
        {
            new:true
        },
        (err,data)=>{
            if(err){
                return resp.json({error:err})
            }
            User.findByIdAndUpdate(req.user._id,{
               $push:{following:req.body.id} 
            },
            {
                new:true
            }
            )
            .then(res=>{
                resp.json({res,data})
            })
            .catch(err=>{
                console.log(err)
            })
        }
            )
})

router.put("/unfollow",tokenvarify,(req,resp)=>{
    User.findByIdAndUpdate(req.body.id,{
        $pull:{followers:req.user._id}
    },
    {
        new:true
    },
    (err,data)=>{
        if(err){
            return resp.json({error:err})
        }
        User.findByIdAndUpdate(req.user._id,{
           $pull:{following:req.body.id} 
        },
        {
            new:true
        }
        )
        .then(res=>{
            resp.json({res,data})
        })
        .catch(err=>{
            console.log(err)
        })
    }
        )
})

router.get("/followedpost/:id",(req,resp)=>{
       User.findOne({_id:req.params.id})
       .then(res=>{
        
        Post.find({postedBy:{ $in: res.following}})
        .populate("postedBy", "name _id")
        .then(resu=>{
         
            resp.json(resu)
        })
        .catch(err=>{
            console.log(err)
        })
       })
       .catch(err=>{
        console.log(err)
       })
})

module.exports = router





 