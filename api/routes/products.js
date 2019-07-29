const router=require('express').Router();
const mongoose=require('mongoose');
const Product=require('../models/product');

router.get('/',async(req,res)=>{
    try {
        const result =await Product.find().select('_id name price');
        const response={
            count:result.length,
            products:result.map(doc=>{
                const{_id,name,price}=doc;
                return{
                    _id,
                    name,
                    price,
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

router.post('/',async (req,res)=>{
    const product=new Product({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price
    })
    try {
        const result=await product.save();
        const {_id,name,price}=result
        const response={
            message:"Product created successfully",
            product:{_id,name,price,request:{type:'GET',url:"http://localhost:5000/api/products/"+_id}}
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
        const result =await Product.findById(id).select("_id name price");
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

router.delete('/:id',async (req,res)=>{
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

router.patch('/:id',async (req,res)=>{
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