const router=require('express').Router();

router.get('/',(req,res)=>{
    res.status(200).json({
        message:"Get All Orders"
    })
});

router.get('/:id',(req,res)=>{
    const id=req.params.id;
    res.status(200).json({
        id
    })
})

router.delete('/:id',(req,res)=>{
    const id=req.params.id;
    res.status(200).json({
        message:"Order Deleted"
    })
})

module.exports=router;