const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()
const user = mongoose.model("user")
const bcrypt = require("bcrypt")
const webtocken = require("jsonwebtoken")
const { JWT_SECRET_TOKEN } = require("../keys")
// const tokenvarify =require("../middleware/user")

router.post("/signup", (req, resp) => {
    const { name, email, password } = req.body
    let validatemail=
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    
     const validatepass=/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
     if(!validatemail.test(email)){
        return resp.json({ error: "Invalid mail Id or password" })
     }
     if(!validatepass.test(password)){
        return resp.json({ error: "Your Password Must Contain Minimum eight characters, at least one letter, one number and one special character" })
     }
    if (!name || !email || !password) {
    return resp.json({ error: "pls enter fields" })
    }
    user.findOne({ email: email })
        .then((savedinfo) => {
            if (savedinfo) {
                return resp.json({ error: "email already exist" })
            }
            bcrypt.hash(password, 8)
                .then(hashedp => {
                    const data = new user({
                        name,
                        email,
                        password: hashedp
                    })
                    data.save().then(() => {
                        resp.json({
                            message: "data saved successfully"
                        })
                    }).catch((err) => {
                        console.log(err)
                    })
                })
        })
        .catch((err) => {
            console.log(err)
        })

})

router.post("/signin", (req, resp) => {
    const { email, password } = req.body
    if (!email || !password) {
        return resp.json({ error: "plzz enter valid email and password" })
    }
    user.findOne({ email: email })
        .then(savedinfo => {
            if (!savedinfo) {
                return resp.json({ error: "plzz enter email orr passord" })
            }
            bcrypt.compare(password, savedinfo.password)
                .then(validpassword => {
                    if (validpassword) {
                         const {name,email,_id}=savedinfo
                        const usertocken = webtocken.sign({ _id: savedinfo._id }, JWT_SECRET_TOKEN)
                        resp.json({ Token: usertocken,userdetail:{
                            name,email,_id
                        } })
                    }
                    else {
                        resp.json({ error: "invalid email orr password" })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router