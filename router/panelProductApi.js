const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;

const ProductSchema = require('../model/Order/sepidarstock');
//const BrandSchema = require('../model/products/brand')
const category = require('../model/products/category');

const BrandSchema = require('../model/brands/brand')
const Filters = require('../model/products/Filters');
const factory = require('../model/products/factory');

/*Product*/
router.post('/fetch-product',jsonParser,async (req,res)=>{
    var productId = req.body.productId?req.body.productId:''
    try{
        if(!productId){
            res.json({filter:{}})
            return
        } 
        const productData = await ProductSchema.findOne({_id: ObjectID(productId)})
        //const brandList = await BrandSchema.find({})
        const categoryList = await category.find({})
       res.json({filter:productData,categoryList:categoryList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-product',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    try{const data={
        category:req.body.category,
        title:req.body.title,
        sku:req.body.sku,
        brand:req.body.brand,
        active:req.body.active,
        offset:req.body.offset,
        pageSize:pageSize
    }
        const productList = await ProductSchema.aggregate([
            { $match:data.title?{title:new RegExp('.*' + data.title + '.*')}:{}},
            { $match:data.sku?{sku:new RegExp('.*' + data.sku + '.*')}:{}},
            { $match:data.category?{category:data.category}:{}},
            { $match:data.active?{enTitle:{ $exists: true}}:{}},
            
            ])
            const products = productList.slice(offset,
                (parseInt(offset)+parseInt(pageSize)))  
            
            
           res.json({filter:products,
            size:productList.length,full:productList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/editProduct',jsonParser,async(req,res)=>{
    var productId= req.body.productId?req.body.productId:''
    if(productId === "new")productId=''
    try{ 
        const data = req.body
        var productResult = ''
        if(productId) productResult=await ProductSchema.updateOne({_id:ObjectID(productId)},
            {$set:data})
        else
        productResult= await ProductSchema.create(data)
        
        res.json({result:productResult,success:productId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/updateProduct',jsonParser,async(req,res)=>{
    var productId= req.body.productId?req.body.productId:''
    productId=filterNumber(productId)
    if(productId === "new")productId=''
    try{ 
        const newRawData = await fetch(OLD_SITE_URL+"/api/v1/getProduct/"+productId,
            {method: 'GET' ,headers:{"content-type": "application/json"}});
        var result = ''
        try{result =await newRawData.json()}
        catch{
            res.status(400).json({error:"Api not find"})
            return
        }
        const newData = result.data
        const location = "/upload/product/"
        const imageUrl = newData.image_url?location+productId+"."+newData.image_url.split('.').pop():
            "https://sharifoilco.com/images/motor-oil.jpg"
        const thumbUrl = newData.image_url?location+productId+"Thumb."+newData.image_url.split('.').pop():
            "https://sharifoilco.com/images/motor-oil.jpg"
        var status = 0
        await download(OLD_SITE_URL+newData.image_url,imageUrl , function(){
            status=1;
        });
        await resizeImage(imageUrl,thumbUrl)
        //const newImage = resultImage
        //console.log(resultImage)
        res.json({data:newData,image:imageUrl,thumb:thumbUrl,
            success:productId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
var download =async function(uri, filename, callback){
    return new Promise(resolve => {
    request.head(uri, function(err, res, body){
      request(encodeURI(uri)).pipe(fs.createWriteStream("."+filename)).on('close', resolve);
      
    })})
  };

  
/*Product*/
router.post('/fetch-brand',jsonParser,async (req,res)=>{
    var brandId = req.body.brandId?req.body.brandId:''
    try{
        if(!brandId){
            res.json({filter:{}})
            return
        }
        const brandData = await BrandSchema.findOne({_id: ObjectID(brandId)})
       res.json({filter:brandData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-brands',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    try{const data={
        category:req.body.category,
        title:req.body.title,
        showSite:req.body.showSite,
        brand:req.body.brand,
        offset:req.body.offset,
        pageSize:pageSize
    }
        const brandList = await BrandSchema.aggregate([
            { $match:data.title?{title:new RegExp('.*' + data.title + '.*')}:{}},
            { $match:data.category?{category:data.category}:{}},
            { $match:data.showSite?{description:{$exists:true}}:{}},
            ])
            const brands = brandList.slice(offset,
                (parseInt(offset)+parseInt(pageSize)))  
            const typeUnique = [...new Set(brandList.map((item) => item.category))];
            
           res.json({filter:brands,type:typeUnique,
            size:brands.length})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/editBrand',jsonParser,async(req,res)=>{
    var brandId= req.body.brandId?req.body.brandId:''
    if(brandId === "new")brandId=''
    try{ 
        const data = {
            title:  req.body.title,
            category: req.body.category,
            type:req.body.type,
            value:req.body.value,
            description:req.body.description,
            fullDesc:req.body.fullDesc,
            sku: req.body.sku,
            brandCode: req.body.brandCode,
            enTitle: req.body.brandCode,
            price: req.body.price,
            quantity: req.body.quantity,
            factory: req.body.factory,
            sort: req.body.sort,
            brandUrl:  req.body.brandUrl,
            imageUrl:  req.body.imageUrl
        }
        var brandResult = ''
        if(brandId) brandResult=await BrandSchema.updateOne({_id:brandId},
            {$set:data})
        else
        brandResult= await BrandSchema.create(data)
        
        res.json({result:brandResult,success:brandId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

/*Category*/
router.post('/fetch-category',jsonParser,async (req,res)=>{
    var catId = req.body.catId?req.body.catId:''
    try{
        if(!catId){
            res.json({filter:{}})
            return
        }
        const catData = await category.findOne({_id: ObjectID(catId)})
       res.json({filter:catData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-category',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    try{const data={
        category:req.body.category,
        title:req.body.title,
        brand:req.body.brand,
        offset:req.body.offset,
        pageSize:pageSize
    }
        const catData = await category.aggregate([
            { $match:data.title?{title:new RegExp('.*' + data.title + '.*')}:{}},
            { $match:data.category?{category:data.category}:{}},
            
            ])
            const cats = catData.slice(offset,
                (parseInt(offset)+parseInt(pageSize)))  
            const typeUnique = [...new Set(cats.map((item) => item.category))];
            
           res.json({filter:cats,type:typeUnique,
            size:cats.length})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/editCats',jsonParser,async(req,res)=>{
    var catId= req.body.catId?req.body.catId:''
    if(catId === "new")catId=''
    try{ 
        const data = {
            title:  req.body.title,
            category: req.body.category,
            type:req.body.type,
            value:req.body.value,
            description:req.body.description,
            fullDesc:req.body.fullDesc,
            sku: req.body.sku, 
            catCode:req.body.catCode,
            price: req.body.price,
            quantity: req.body.quantity,
            brands: req.body.brands,
            sort: req.body.sort,
            imageUrl:  req.body.imageUrl
        }
        var catResult = ''
        if(catId) catResult=await category.updateOne({_id:catId},
            {$set:data})
        else
        catResult= await category.create(data)
        
        res.json({result:catResult,success:catId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


router.post('/findCoridor',jsonParser,async(req,res)=>{
    try{ 
        const data = {
            brand:  req.body.brand,
            lenzDetail: req.body.lenzDetail,
            
        }
        const lenzData = await manufacture.findOne({sku:data.lenzDetail})
        var coridorList=await coridors.findOne({design:lenzData.lenzDesign})
        var visionFit=0
        if(lenzData.lenzDesign==="ANTI FATIGUE")
            visionFit = 1
        res.json({coridors:coridorList?coridorList.coridors:["14","15","16","17","18"],
            visionFit:visionFit})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


/*Filters*/
router.post('/fetch-filter',jsonParser,async (req,res)=>{
    var filterId = req.body.filterId?req.body.filterId:''
    try{
        if(!filterId){
            res.json({filter:{}})
            return 
        }
        const categoryData = await category.find()
        const filterData = await Filters.findOne({_id: ObjectID(filterId)})
       res.json({filter:filterData,category:categoryData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-filter',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    try{const data={
        category:req.body.category,
        title:req.body.title,
        enTitle:req.body.enTitle,
        type:req.body.type,
    }
        const filterList = await Filters.aggregate([
            { $match:data.title?{title:new RegExp('.*' + data.title + '.*')}:{}},
            { $match:data.category?{category:data.category}:{}},
            { $match:data.type?{type:data.type}:{}},
            ])
            const filters = filterList.slice(offset,
                (parseInt(offset)+parseInt(pageSize)))  
            const typeUnique = [...new Set(filterList.map((item) => item.category))];
            
           res.json({filter:filters,type:typeUnique,
            size:filterList.length})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/edit-filter',jsonParser,async(req,res)=>{
    var filterId= req.body.filterId?req.body.filterId:''
    if(filterId === "new")filterId=''
    try{ 
        const data = {
            category:req.body.category,
            title:req.body.title,
            enTitle:req.body.enTitle,
            type:req.body.type,
            optionsP:req.body.optionsP,
            optionsN:req.body.optionsN,
            sort:req.body.sort
        }
        var filterResult = ''
        if(filterId) filterResult=await Filters.updateOne({_id:filterId},
            {$set:data})
        else
        filterResult= await Filters.create(data)
        
        res.json({result:filterResult,success:filterId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

/*Factory*/
router.post('/fetch-factory',jsonParser,async (req,res)=>{
    var factoryId = req.body.factoryId?req.body.factoryId:''
    try{
        if(!factoryId){
            res.json({filter:{}})
            return
        }
        const filterData = await factory.findOne({_id: ObjectID(factoryId)})
       res.json({filter:filterData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-factory',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    try{const data={
        category:req.body.category,
        title:req.body.title,
        enTitle:req.body.enTitle,
        type:req.body.type,
    }
        const filterList = await factory.aggregate([
            { $match:data.title?{title:new RegExp('.*' + data.title + '.*')}:{}},
            { $match:data.category?{category:data.category}:{}},
            { $match:data.type?{type:data.type}:{}},
            ])
            const filters = filterList.slice(offset,
                (parseInt(offset)+parseInt(pageSize)))  
            const typeUnique = [...new Set(filterList.map((item) => item.category))];
              
           res.json({filter:filters,type:typeUnique,
            size:filterList.length})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/edit-factory',jsonParser,async(req,res)=>{
    var factoryId= req.body.factoryId?req.body.factoryId:''
    if(factoryId === "new")factoryId=''
    try{ 
        const data = {
            title:req.body.title,
            enTitle:req.body.enTitle
        }
        var filterResult = ''
        if(factoryId) filterResult=await factory.updateOne({_id:factoryId},
            {$set:data})
        else
        filterResult= await factory.create(data)
        
        res.json({result:filterResult,success:factoryId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

module.exports = router;