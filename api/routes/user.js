const express = require('express')
const router = express.Router();
const mongoose=require('mongoose');
const User=require('../models/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require('dotenv').config();
const auth=require('../middlewares/auth')

router.post('/signup',async(req,res)=>{
    try {
        const usr=await User.find({email:req.body.email});
    if(usr.length>=1)
        res.status(409).json({message:"Email already exist"})
    else{
        bcrypt.hash(req.body.password,10,(error,hash)=>{
            if(error)
            {
                return  res.status(500).json({message:"Password Required"})
            }
                
            else{
                const user=new User({
                    _id:new mongoose.Types.ObjectId(),
                    email:req.body.email,
                    password:hash,
                    tokens:[]
                })
    
                 const result=user.save()
                 .then(result=>{
                    const {_id,email}=result;
                    res.status(201).json({
                        message:"User created",
                        user:{_id,email}
                    });
                 })
                .catch(error=>{
                    console.log(error);
                    res.status(500).json(error);
                })
            }
        })
    }

    } catch (error) {
        console.log(error);
        res.status(500).json({error:error});
    }
    

    
    
})

router.post('/login',async(req,res)=>{
    try {
        const user=await User.find({email:req.body.email});
        if(user.length < 1){
            res.status(401).json({message:'Auth Failed'});
        }
        else{
            bcrypt.compare(req.body.password,user[0].password,async(err,result)=>{
                if(err)
                    return res.status(401).json({message:'Auth Failed'});
                if(result){
                    const token=jwt.sign({
                        email:user[0].email,
                        userId:user[0]._id
                    },
                    process.env.JWT_SECRET
                    )
                    user[0].tokens=user[0].tokens.concat({token});
                    await user[0].save();
                    return res.status(200).json({message:'Auth Successful',user:user[0],token});
                }
                res.status(401).json({message:'Auth Failed'})
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:error});
    }
})

router.post('/logout',auth,async(req,res)=>{

    try {
        req.userData.tokens=req.userData.tokens.filter(token=>{
            token.token !== req.token
        })
        await req.userData.save();
        res.status(200).json({message:"Logout Success"})
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})
router.get('/profile',auth,async(req,res)=>{
    console.log(req.userData);
    res.status(200).json(req.userData);
})

module.exports=router;