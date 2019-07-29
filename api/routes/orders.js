const router=require('express').Router();
const mongoose=require('mongoose');
const Order=require('../models/order');
const Product=require('../models/product')

router.get('/',async (req,res)=>{
    try {
        const result=await Order.find().select("_id product quantity");
        const response={
            count:result.length,
            orders:result.map(doc=>{
                const {_id,product,quantity}=doc;
                return{
                    _id,
                    product,
                    quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:5000/api/orders/'+_id
                    }
                }
            })
        }
        res.status(200).json(response)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    
});

router.post('/',async (req,res)=>{
    
    const order=new Order({
        _id:new mongoose.Types.ObjectId(),
        quantity:req.body.quantity,
        product:req.body.productId
    })
    try {
        const prd=await Product.findById(order.product);
        //console.log(prd)
        if(!prd)
            return res.status(400).json({message:"Product Not found"});
        const result=await order.save();
        const {_id,product,quantity}=result;
        const response={
            message:"Order Created",
            order:{
                _id,
                product,
                quantity,
                request:{
                    type:"GET",
                    url:"http://localhost:5000/api/orders/"+_id
                }
            }
        }
        res.status(201).json(response)
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

router.get('/:id',async (req,res)=>{
    const id=req.params.id;
    try {
        const result=await Order.findById(id).select("_id quantity product");
        if(result)
        res.status(200).json(result);
        else
            res.status(404).json({message:"No valid Entry Found"});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

router.delete('/:id',async (req,res)=>{
    const id=req.params.id;
    try {
        const result=await Order.findByIdAndDelete(id).select("_id quantity product");
        if(result)
            res.status(200).json(result);
        else
            res.status(404).json({message:"No valid Entry Found"});
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
})

module.exports=router;