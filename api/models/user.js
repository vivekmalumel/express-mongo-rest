const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email:{type:String,
        required:true,
        unique:true,
        match:/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    },
    password:{type:String,required:true},
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{timestamps:true})
module.exports=mongoose.model('User',userSchema);