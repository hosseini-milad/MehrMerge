const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
const xlsx = require('node-xlsx');
var ObjectID = require('mongodb').ObjectID;
const HesabFaApiCall = require('../AdminPanel/components/hesabFaApiCall');

const ColorSchema = require('../model/products/color');
const XtraSchema = require('../model/products/xtra');
const MirrorSchema = require('../model/products/mirror');
const PagesSchema = require('../model/pages');
const RXSchema = require('../model/Order/rx');
const OrderSchema = require('../model/Order/orders');
const PostSchema = require('../model/products/Post');
const logSchema = require('../model/Params/logs')
const orderLogSchema = require('../model/Params/logsOrder')
const SliderSchema = require('../model/slider');
const CategorySchema = require('../model/products/category');
const ProductSchema = require('../model/products/Product');
const fs = require('fs');
const mime = require('mime');
const user = require('../model/user');
const sepidarPOST = require('../middleware/SepidarPost');
const sepidarGET = require('../middleware/SepidarGET');
const learn = require('../model/Params/learn');
const notif = require('../model/Params/notif');
const adv = require('../model/Params/adv');
const message = require('../model/Params/message');
const docCat = require('../model/Params/docCat');
const docSchema = require('../model/Params/document');
const CreateMock = require('../middleware/CreateMocks');
const state = require('../model/Params/state');
const city = require('../model/Params/city');

router.post('/upload',jsonParser, async(req, res, next)=>{
    ////console.log("UploadApi")
    try{
    // to declare some path to store your converted image
    var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
    return new Error('Invalid input string');
    }
     
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    let fileName = `MGM-${Date.now().toString()+"-"+req.body.imgName}`;
    ////console.log(fileName)
   
    fs.writeFileSync("./uploads/setting/" + fileName, imageBuffer, 'utf8');
    return res.send({"status":"success",url:"/uploads/setting/"+fileName});
    } catch (e) {
        res.send({"status":"failed",error:e});
    }
})

router.post('/color',async (req,res)=>{
    ////console.log("ColorApi")
    try{
        const colorData = await ColorSchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:colorData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/color/update',async (req,res)=>{
    ////console.log("ColorUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        colorCode: req.body.colorCode,
        colorPrice:req.body.colorPrice,
        title:req.body.title
    }
    try{
        //var colorData = ''
        const colorData = data.id? await ColorSchema.updateOne({_id:data.id},{$set:data})
        :await ColorSchema.create(data);
        res.json({data:colorData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/mirror',async (req,res)=>{
    //console.log("MirrorApi")
    try{
        const mirrorData = await MirrorSchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:mirrorData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/mirror/update',async (req,res)=>{
    //console.log("MirrorUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        colorCode: req.body.colorCode,
        colorPrice:req.body.colorPrice,
        title:req.body.title
    }
    try{
        //var colorData = ''
        const colorData = data.id? await MirrorSchema.updateOne({_id:data.id},{$set:data})
        :await MirrorSchema.create(data);
        res.json({data:colorData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/xtra',async (req,res)=>{
    //console.log("XtraApi")
    try{
        const xtraData = await XtraSchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:xtraData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/xtra/update',async (req,res)=>{
    //console.log("XtraUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        colorCode: req.body.colorCode,
        colorPrice:req.body.colorPrice,
        title:req.body.title
    }
    try{
        //var colorData = ''
        const xtraData = data.id? await XtraSchema.updateOne({_id:data.id},{$set:data})
        :await XtraSchema.create(data);
        res.json({data:xtraData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/category',async (req,res)=>{
    //console.log("CategoryApi")
    try{
        const categoryData = await CategorySchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:categoryData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/category/update',async (req,res)=>{
    //console.log("CategoryUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
        title:req.body.title
    }
    try{
        const ctegoryData = data.id? await CategorySchema.updateOne({_id:data.id},{$set:data})
        :await CategorySchema.create(data);
        res.json({data:ctegoryData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/product',async (req,res)=>{
    //console.log("ProductApi")
    try{
        const productData = await ProductSchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:productData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/productEN',async (req,res)=>{
    //console.log("ProductEnApi")
    try{
        const productData = await ProductSchema.findOne(
            req.body.enTitle&&{enTitle:req.body.enTitle}).sort({"sort":1});
        res.json({data:productData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/product/update',async (req,res)=>{
    //console.log("ProductUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        imgGalleryUrl:req.body.imgGalleryUrl,
        description: req.body.description,
        fullDesc:req.body.fullDesc,
        config:req.body.config,
        title:req.body.title,
        enTitle:req.body.enTitle,
    }
    try{
        const productData = data.id? await ProductSchema.updateOne({_id:data.id},{$set:data})
        :await ProductSchema.create(data);
        res.json({data:productData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/pages',async (req,res)=>{
    //console.log("PagesApi")
    try{
        const pagesData = await PagesSchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:pagesData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/pages/update',async (req,res)=>{
    //console.log("PageUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        url: req.body.url,
        title: req.body.title,
        description:req.body.description,
        fullDesc:req.body.fullDesc
    }
    try{
        //var colorData = ''
        const pagesData = data.id? await PagesSchema.updateOne({_id:data.id},{$set:data})
        :await PagesSchema.create(data);
        res.json({data:pagesData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/blog',async (req,res)=>{
    //console.log("BlogApi")
    try{
        const postData = await PostSchema.find(req.body.id&&{_id:req.body.id}).sort({"sort":1});
        res.json({data:postData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/blog/update',async (req,res)=>{
    //console.log("BlogUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        url: req.body.url,
        title: req.body.title,
        description:req.body.description,
        fullDesc:req.body.fullDesc
    }
    try{
        //var colorData = ''
        const postData = data.id? await PostSchema.updateOne({_id:data.id},{$set:data})
        :await PostSchema.create(data);
        res.json({data:postData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/slider',async (req,res)=>{
    //console.log("SliderApi")
    try{
        const sliderData = await SliderSchema.find(req.body.id&&{_id:req.body.id});
        res.json({data:sliderData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/slider/update',async (req,res)=>{
    //console.log("SliderUpdateApi")
    const data = {
        id:req.body.id,
        imageUrl: req.body.imageUrl,
        title: req.body.title,
        description:req.body.description
    }
    try{
        const sliderData = data.id? await SliderSchema.updateOne({_id:data.id},{$set:data})
        :await SliderSchema.create(data);
        res.json({slider:sliderData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
 
router.post('/log',async (req,res)=>{
    //console.log("LogApi")
    try{
        if(req.body.kind==='')res.json({log:[]})
        const logsData = await logSchema.find(req.body.status&&
            {status:req.body.status}).find(req.body.kind&&{kind:req.body.kind})
        res.json({log:logsData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/log/update',async (req,res)=>{
    //console.log("LogUpdateApi")
    try{
    const data = {
        id:req.body.id,
        title: req.body.title,
        user: req.body.user,
        phone: req.body.phone,
        kind:req.body.kind,
        description: req.body.description,
        status: req.body.status,
        date:Date.now(),
        modifyDate:req.body.modifyDate
    } 
        
        const logsData = data.id? await logSchema.updateOne({_id:data.id},{$set:data})
        :await logSchema.create(data);
        res.json({log:logsData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/orderlog',async (req,res)=>{
    //console.log("LogApi")
    const orderData = await OrderSchema.findOne({stockOrderNo:req.body.rxOrderNo})
    const userData = await user.findOne({_id:orderData.userId})
    //console.log(userData)
    try{
        const logsData = await orderLogSchema.find({rxOrderNo:req.body.rxOrderNo})
        res.json({log:logsData,user:userData})
    } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/orderlog/update',async (req,res)=>{
    //console.log("LogUpdateApi")
    try{
    const data = {
        id:req.body.id,
        title: req.body.title,
        user: req.body.user,
        phone: req.body.phone,
        kind:req.body.kind,
        description: req.body.description,
        status: req.body.status,
        date:Date.now(),
        modifyDate:req.body.modifyDate
    } 
        
        const logsData = data.id? await logSchema.updateOne({_id:data.id},{$set:data})
        :await logSchema.create(data);
        res.json({log:logsData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

const timer = ms => new Promise(res => setTimeout(res, ms))

router.post('/parse-users',jsonParser,async (req,res)=>{
    try{
        const url = req.body.url
        //const data = fs.readFileSync(url)
        //console.log(data)
        
        const workSheetsFromFile = xlsx.parse(
            __dirname +"/../"+url);
            console.log(workSheetsFromFile)
        const data = workSheetsFromFile[0].data
        var resultOut =[]
        for(var i=1;i<data.length;i++){
            var Guid = parseInt(Math.random()*79999999+10000000)+`-fc79-417f-b8cf-3a1111111111`
            var parseData=
                {
                    "GUID": Guid,
                    "NationalID":data[i][3],
                    "Name": data[i][1],
                    "LastName": data[i][2],
                    "CustomerType": 1,
                    "Addresses":[{"Title": "البرز-کرج","Address": "خیابان","cityRef":1,
                                               "GUID": Guid}]
                  } 
            var result = await sepidarPOST("Customers",parseData);
            //console.log(result)
            resultOut.push({result:result,query:parseData})
            console.log({ID: result.CustomerID,
			Title:result.Title,Code: result.Code})
            await timer(300);
        }
        //console.log(parseData)
        res.json(resultOut)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/find-users',jsonParser,async (req,res)=>{
    try{
        var usersList = await sepidarGET("/Customers");
        try{
            const url = req.body.url
            //const data = fs.readFileSync(url)
            //console.log(data)
            const workSheetsFromFile = xlsx.parse(
                __dirname +"/../"+url);
            const data = workSheetsFromFile[0].data
            var resultOut =[]
            for(var i=1;i<data.length;i++){
                if(i==10) break 
                var user = ''
                if(!data[i]) continue
                if(!data[i][0])continue
                for(var u=0;u<usersList.length;u++)
                    if(data[i][0].includes(usersList[u]&&
                        usersList[u].NationalID)){
                        user = usersList[u]
                        break;
                    }
                //const user = usersList.find(item=>item.PhoneNumber)
                var query=
                    {
                        "GUID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "CurrencyRef": 1,
                        "CustomerRef": 1,
                        "AddressRef": 1,
                        "SaleTypeRef": 1,
                        "Price": 0,
                        "Items": [
                            {
                            "ItemRef": 1,
                            "StockRef": 1,
                            "Quantity": 0,
                            "Fee": 0,
                            "Price": 0,
                            "Description": "string"
                            }
                        ]
                           
                    }
                //var result = await sepidarPOST("Customers",parseData);
                resultOut.push({user:user,query:"query",data:data[i]})
                //await timer(1000);
                //if(i>5) break
            }
            //console.log(parseData)
            res.json(resultOut)
            return
            
        }
        catch(error){
            res.status(500).json({message: error.message})
        } 
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-docCat',jsonParser,async (req,res)=>{
    try{
        var docCatData = await docCat({});
        res.json(docCatData)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-docCat',jsonParser,async (req,res)=>{
    const docId = req.body.id
    const data=req.body 
    try{
        var docCatData = docId?
        await updateOne({id:docId},{$set:data}):
        await insertOne(data)
        res.json(docCatData)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/list-document',jsonParser,async (req,res)=>{
    try{
        var result = await sepidarPOST("/Customers",'','GET');
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/find-document',jsonParser,async (req,res)=>{
    try{
        var result = await sepidarPOST("/Customers",'','GET');
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})


router.post('/list-learn',jsonParser,async (req,res)=>{
    try{
        var result = await learn.find({feature:{$ne:true}});
        var mainLearn = await learn.findOne({feature:true});
        mainLearn.videoUrl = mainLearn?mainLearn.uploadUrl:''
        res.json({filter:result,mainLearn:mainLearn})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/fetch-learn',jsonParser,async (req,res)=>{
    const learnCode = req.body.learnCode
    try{
        var result = learnCode?await learn.findOne({_id:ObjectID(learnCode)}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-learn',jsonParser,async (req,res)=>{
    var learnCode = req.body.learnCode
    if(learnCode==="new") learnCode = ""
    const data = req.body

    try{
        var result = learnCode?await learn.updateOne({_id:ObjectID(learnCode)},{$set:data}):
        await learn.create(data);
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})


router.post('/list-notif',jsonParser,async (req,res)=>{
    try{
        var result = await notif.find();
        
        res.json({filter:result})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/fetch-notif',jsonParser,async (req,res)=>{
    const notifCode = req.body.notifCode
    try{
        var result = notifCode?await notif.findOne({enTitle:notifCode}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-notif',jsonParser,async (req,res)=>{
    var notifCode = req.body.notifCode
    if(notifCode==="new") notifCode = ""
    const data = req.body

    try{
        var result = notifCode?await notif.updateOne({enTitle:notifCode},{$set:data}):
        await notif.create(data);
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/list-message',jsonParser,auth,async (req,res)=>{
    const userId=req.headers['userid']
    try{
        var result = await message.find({userId:userId});
       
        res.json({filter:result})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-message',jsonParser,auth,async (req,res)=>{
    const userId=req.headers['userid']
    var messageId = req.body.messageId
    const data={
        status:req.body.status
    }
    try{
        var result = messageId?
        await message.updateOne({_id:ObjectID(messageId),userId:userId},
            {$set:data}):
        await message.updateMany({userId:userId},
            {$set:data})    
        res.status(200).json({result:result,message:"آپدیت انجام شد"})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/show-notif',jsonParser,async (req,res)=>{
    var userId = req.headers["userid"]
    const notifCode = req.body.notifCode

    try{
        const notifResult = await notif.findOne({_id:ObjectID(notifCode)})
        if(!notifResult){
            res.status(400).json({message: "یافت نشد", error:"Not Found"}) 
            return
        }
        var result = await user.updateOne({_id:ObjectID(userId)},
            {$set:{showNotif:notifCode}})
        
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
/*Advertise*/
router.post('/list-adv',jsonParser,async (req,res)=>{
    try{
        var count= req.body.count?req.body.count:3
        var result = await adv.find().limit(count);
       
        res.json({filter:result})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/fetch-adv',jsonParser,async (req,res)=>{
    const advId = req.body.advId
    try{
        var result = advId?await adv.findOne({_id:ObjectID(advId)}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-adv',jsonParser,async (req,res)=>{
    var advId = req.body.advId
    if(advId==="new") advId = ""
    const data = req.body

    try{
        var result = advId?await adv.updateOne({_id:ObjectID(advId)},{$set:data}):
        await adv.create(data);
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/delete-adv',jsonParser,auth,async (req,res)=>{
    var advId = req.body.advId
    if(!advId) {
        res.status(400).json({message:"not found"})
        return
    }

    try{
        var result = await adv.deleteOne({_id:ObjectID(advId)})
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

/*Document*/
router.post('/list-doc',jsonParser,async (req,res)=>{
    try{
        var result = await docSchema.find();
       
        res.json({filter:result})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.get('/list-mocks',jsonParser,async (req,res)=>{
    try{
        var documents = await docSchema.find();
        var docCats = await docCat.find();
        const mocks = await CreateMock(docCats,documents)
        res.json(mocks)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/fetch-doc',jsonParser,async (req,res)=>{
    const docId = req.body.docId
    try{
        var result = docId?await docSchema.findOne({_id:ObjectID(docId)}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-doc',jsonParser,async (req,res)=>{
    var docId = req.body.docId
    if(docId==="new") docId = ""
    const data = req.body

    try{
        var result = docId?await docSchema.updateOne({_id:ObjectID(docId)},{$set:data}):
        await docSchema.create(data);
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/delete-doc',jsonParser,auth,async (req,res)=>{
    var docId = req.body.docId
    if(!docId) {
        res.status(400).json({message:"not found"})
        return
    }

    try{
        var result = await docSchema.deleteOne({_id:ObjectID(docId)})
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})


/*City State*/
router.post('/list-state',jsonParser, async (req,res)=>{
    const search = req.body.search
    try{
        const stateList = await state.find(search?
            {stateName:new RegExp('.*' + search + '.*')}:{})
        res.json({data:stateList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list-city',jsonParser, async (req,res)=>{
    const search = req.body.search
    const state = req.body.stateId
    try{
        if(!state){
            res.status(400).json({message: "لطفا کد استان را وارد نمایید"})
            return('')
        }
        const cityList = await city.find(search?
            {cityName:new RegExp('.*' + search + '.*'),
            stateId:state}:{stateId:state})
        res.json({data:cityList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


router.post('/remain-credit',jsonParser,async(req,res)=>{
    const url = req.body.url
        //const data = fs.readFileSync(url)
        //console.log(data)
        
        const workSheetsFromFile = xlsx.parse(
            __dirname +"/../"+url); 
            console.log(workSheetsFromFile)
        const data = workSheetsFromFile[0].data
        var resultOut =[]
        for(var i=1;i<data.length;i++){
            const updateResult = await user.updateOne({meli:data[i][0]},
                {$set:{remainCredit:data[i][1],remainFob:data[i][2]}}
            )
            if(!updateResult.matchedCount){
                resultOut.push(data[i][0])
            }
        }
        res.json(data)
})
module.exports = router;