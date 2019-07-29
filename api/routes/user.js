const express = require('express')
const router = express.Router()

router.get('/',(req,res)=>{
    res.send("<h3>User Route</h3>")
})

module.exports=router;