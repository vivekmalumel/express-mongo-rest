const jwt=require('jsonwebtoken');
require('dotenv').config();
const User=require('../models/user')
module.exports=async(req,res,next)=>{
    try {
        const token=req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const usr=await User.findOne({_id:decoded.userId,'tokens.token':token})
        if(!usr)
            return res.status(401).json({message:"Auth Failed"});
        req.userData=usr;
        req.token=token;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({message:"Auth Failed"});
    }
    
}