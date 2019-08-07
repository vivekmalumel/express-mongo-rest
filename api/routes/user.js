const express = require('express');
const multer = require('multer')
const sharp = require('sharp')
const router = express.Router();
const mongoose=require('mongoose');
const User=require('../models/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require('dotenv').config();
const auth=require('../middlewares/auth')
const {sendWelcomeEmail,sendCancelEmail}=require('../email/account')

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
                //Send Welcome Email
                sendWelcomeEmail(user.email,'Test Name');
    
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

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

//Adding Profile Picture as buffer in DB
router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.userData.avatar = buffer
    await req.userData.save()
    res.status(201).json({message:"Upload Success"})
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).json({error:"No avatar found!"})
    }
})


router.delete('/profile',auth,async(req,res)=>{
    try {
        await req.userData.remove();
        sendCancelEmail(req.userData.email,'Vivek');
        res.json(req.userData);
    } catch (error) {
        res.status(500).send();
    }
})


router.delete('/profile/avatar', auth, async (req, res) => {
    console.log(req.userData);
    req.userData.avatar = undefined;
    await req.userData.save()
    res.send()
})

module.exports=router;