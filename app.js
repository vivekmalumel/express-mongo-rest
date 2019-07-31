const express=require('express');
const app=express();
const morgan=require('morgan');
const mongoose=require('mongoose');
const productRouter=require('./api/routes/products');
const orderRouter=require('./api/routes/orders');
const userRouter=require('./api/routes/user')
require('dotenv').config();

app.use('/uploads',express.static('public/uploads'));

mongoose.connect(process.env.dbUrl,{useNewUrlParser:true})
.then(()=>{
    console.log("Database Connected");
})
.catch(err=>{
    console.log('Error:'+err);
})
const port=process.env.PORT || 5000;

app.use(morgan('dev'));

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
    if(req.method=== 'OPTIONS'){
        res.header("Access-Control-Allow-Methods","PUT,POST,PATCH,GET,DELETE");
        return res.status(200).json({});
    }
    next();
  });

app.use('/api/user',userRouter);
app.use('/api/products',productRouter);
app.use('/api/orders',orderRouter);

app.get('/',(req,res)=>{
    res.send("<h1>Hello World</h1>")
})

app.listen(port,()=>{
    console.log(`Server started in port ${port}`);
})