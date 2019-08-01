const router=require('express').Router();
const mongoose=require('mongoose');
const Product=require('../models/product');
const multer  = require('multer');
const sharp = require('sharp');
const auth=require('../middlewares/auth');
require('dotenv').config();

//Multer config for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+'-'+file.originalname)
    }
  })


const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png')
        cb(null,true);
    else
        cb(null,false);
}

const generateThumb=(req,res,next)=>{
    console.log("Woooowww");
    let width=200;
    let height=200;
    sharp(req.file.path)
    .resize(width,height,{
        kernel: sharp.kernel.nearest,
        fit:sharp.fit.cover }
    )
    .extend({
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
    .toFile(`public/uploads/thumbs/xs-${req.file.filename}`).then(info=>
    {
            console.log("sharp worked:",info)
            next();
    })
    .catch(error=>{
        res.status(500).json({error:"Thumbnail Creation Failed:"+error})
    })
    
}

const upload = multer({
    storage,
    limits:{
    fileSize:1024*1024*5
    },
    fileFilter
})



router.get('/',async(req,res)=>{
    try {
        const result =await Product.find().select('_id name price productImage');
        const response={
            count:result.length,
            products:result.map(doc=>{
                const{_id,name,price,productImage}=doc;
                return{
                    _id,
                    name,
                    price,
                    productImage,
                    request:{type:'GET',url:"http://localhost:5000/api/products/"+_id}
                }
            })
        }
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
});

router.post('/',auth,upload.single('productImage'),generateThumb,async (req,res)=>{
    //console.log(req.file);
    const product=new Product({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:process.env.BASE_URL+'uploads/'+req.file.filename
    })
    try {
        const result=await product.save();
        const {_id,name,price,productImage}=result
        const response={
            message:"Product created successfully",
            product:{_id,name,price,productImage,request:{type:'GET',url:"http://localhost:5000/api/products/"+_id}}
        }
        res.status(201).json(response)
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
    
    
})

router.get('/:id',async (req,res)=>{
    const id=req.params.id;
    try {
        const result =await Product.findById(id).select("_id name price productImage");
        if(result){
           // const {_id,name,price}=result;
            res.status(200).json(result);
        }
        else{
            res.status(404).json({message:"No valid Entry Found"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
})

router.delete('/:id',auth,async (req,res)=>{
    const id=req.params.id;
    try {
        const result =await Product.findByIdAndDelete(id);
        if(result){
            const {_id,name,price}=result
            res.status(200).json({_id,name,price});
        }
        else{
            res.status(404).json({message:"No valid Entry Found"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
})

router.patch('/:id',auth,async (req,res)=>{
    const id=req.params.id;
    const fields=req.body;
    const updateOps={};
    for(const [key,value] of Object.entries(fields) ){
       
        updateOps[key]=value;
    }
    console.log(updateOps);
    try {
        const result =await Product.update({_id:id},{$set:updateOps});
        if(result.n){
            res.status(200).json(result);
        }
        else{
            res.status(404).json({message:"No valid Entry Found"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
})
module.exports=router;