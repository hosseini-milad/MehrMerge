const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()

const Product = require('../model/products/Product');
const catModel = require('../model/products/category');
const brandModel = require('../model/brands/brand');
const pages = require('../model/pages');
const mgmInfo = require('../model/mgmInfo');
const user = require("../model/user") 
const offerLogSchema = require("../model/Params/logsOffer")
const lenzStockSchema = require('../model/Order/stock');
const Offers = require('../model/Order/Offers');
const sepidarstock = require('../model/Order/sepidarstock');

router.get('/product/:sku',async (req,res)=>{
     //console.log(("ProductSkuApi")
    try{
        const proData = await Product.find({sku:req.params.sku});//.aggregate([{$lookup:{from : "categories", localField: "categories", foreignField: "_id", as : "catName"}}]))
        res.json({products:proData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/categories',async (req,res)=>{
     //console.log(("CategoryApi")
    try{
        const catData = await catModel.find({});
        const products = await Product.find({categories})
        res.json({categories:catData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/pages',async (req,res)=>{
     //console.log(("PagesApi")
    try{
        const pageData = await pages.find();
        const mgminfo = await mgmInfo.find();
        res.json({pages:pageData,mgminfo:mgminfo})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/brands',async (req,res)=>{
     //console.log(("BrandsApi")
    try{
        const brandData = await brandModel.find({});
        res.json({brands:brandData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/brand',async (req,res)=>{
     //console.log(("BrandApi")
    try{
        const brandData = await brandModel.find(req.body.brand?{enTitle:req.body.brand}:{});
        res.json(brandData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/exists-brands',jsonParser,async (req,res)=>{
     //console.log(("ExistsBrandsApi")
    
    const data={
        brandName:req.body.brandName,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        coating:req.body.coating
    }
    //console.log(data.brandName?1:0)
        const brandList = await sepidarstock.find(data.brandName&&{brandName:data.brandName}).distinct("brandName");
        const lenzIndex = await sepidarstock.find(data.lenzIndex?{
            $and:[{brandName:data.brandName},{lenzIndex:data.lenzIndex}]}
            :{ brandName:data.brandName}).distinct("lenzIndex");
        const material = await sepidarstock.find(data.material?{
            $and:[{brandName:data.brandName},{lenzIndex:data.lenzIndex},{material:data.material}]}
            :data.lenzIndex?{
                $and:[{brandName:data.brandName},{lenzIndex:data.lenzIndex}]}
                :{ brandName:data.brandName}).distinct("material");
        const coating = await sepidarstock.find(data.coating?{
            $and:[{brandName:data.brandName},{lenzIndex:data.lenzIndex}
                    ,{material:data.material},{material:data.coating}]}
            :data.material?{
                $and:[{brandName:data.brandName},{lenzIndex:data.lenzIndex},{material:data.material}]}
                :data.lenzIndex?{
                    $and:[{brandName:data.brandName},{lenzIndex:data.lenzIndex}]}
                    :{ brandName:data.brandName}).distinct("coating");    

       
        /*const lenzIndex = brands.filter(item=>{const isDuplicate = uniqueIndex.has(item.lenzIndex);
            uniqueIndex.add(item.lenzIndex);if(!isDuplicate) return true; return false}).lenzIndex*/
    try{     res.json({brandName:brandList,lenzIndex:lenzIndex,material:material,coating:coating})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/set/offers',jsonParser,async (req,res)=>{
     //console.log(("SetOffersApi")
    try{ 
    const data={
        userId:req.body.userId,
        offerCode:req.body.offerCode,
        brandName:req.body.brandName,
        category:req.body.category,
        discountValue:req.body.discountValue,
        discountPercent:req.body.discountPercent,
        discountTimeFrom:req.body.discountTimeFrom,
        discountTimeTo:req.body.discountTimeTo,
        date:Date.now()
    }
    const oldOffer = await Offers.findOne({userId:data.userId,brandName:data.brandName})
    if(oldOffer){
        const offer = await Offers.updateOne({_id:oldOffer._id},data);
        res.json({offers:offer,status:"updated"})  
    } 
    else{
        const newOffer = await Offers.create(data)
        res.json({offers:newOffer,status:"done"})
    } 
    await offerLogSchema.create(data)
        /*const lenzIndex = brands.filter(item=>{const isDuplicate = uniqueIndex.has(item.lenzIndex);
            uniqueIndex.add(item.lenzIndex);if(!isDuplicate) return true; return false}).lenzIndex*/
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list/offers',jsonParser,async (req,res)=>{
     //console.log(("ListOffersApi")
    try{ 
    const data={
        userId:req.body.userId,
        brandName:req.body.brandName,
        discountValue:req.body.discountValue,
    }
        
        const offerList = await Offers.aggregate([
            { $match : data.userId?{userId:data.userId}:{} },
            { $match : data.brandName?{ brandName:data.brandName }:{} },
            {$addFields: { "user_Id": { $toObjectId: "$userId" }}},
            {$lookup:{from : "users", 
            localField: "user_Id", foreignField: "_id", as : "userInfo"}},
            {$sort:{_id:-1}},{$limit:5}
        ])
        /*const lenzIndex = brands.filter(item=>{const isDuplicate = uniqueIndex.has(item.lenzIndex);
            uniqueIndex.add(item.lenzIndex);if(!isDuplicate) return true; return false}).lenzIndex*/
        res.json({offers:offerList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/set/brands', jsonParser,async (req,res)=>{
     //console.log(("SetBrandsApi")
    try{
    const data = {
        title: req.body.title,
        enTitle: req.body.enTitle,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        Coating:req.body.Coating
    }
        const brandData = await brandModel.find({enTitle:data.enTitle});
        !brandData.length?await brandModel.create(data):
            await brandModel.updateOne({enTitle:data.enTitle},data);
        const newData = await brandModel.find();
        res.json({message:"done",newData:newData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


module.exports = router;