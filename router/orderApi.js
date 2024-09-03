const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;

const lenzStockSchema = require('../model/Order/stock');
const ManSchema = require('../model/Order/manufacture');
const OrdersSchema = require('../model/Order/orders');
const ManufactureStateSchema= require('../model/brands/manufacture')
const RXSchema = require('../model/Order/rx');
const ColorSchema = require('../model/products/color');
const MirrorSchema = require('../model/products/mirror');
const CoverSchema = require('../model/products/cover');
const XtraSchema = require('../model/products/xtra');
const userSchema = require('../model/user');
const KharidSchema = require('../model/Order/Kharid')
const userInfo = require('../model/userInfo');
const transferMethod = require('../model/products/transferMethod');
const paymentMethod = require('../model/products/paymentMethod');
const param = require('../model/Params/param');
const orders = require('../model/Order/orders');
const orderLogSchema = require('../model/Params/logsOrder')

const logSchema = require('../model/Params/logs')
const sepidarstock = require('../model/Order/sepidarstock');
const sendSmsUser = require('../AdminPanel/components/sendSms');
const HesabFaApiCall = require('../AdminPanel/components/hesabFaApiCall');
const user = require('../model/user');
const brand = require('../model/brands/brand');
const Cart = require('../model/Order/Cart');
const calcCredit = require('../middleware/CalcCredit');
const calcDiscount = require('../middleware/CalcDiscount');
const calcCreditUser = require('../middleware/calcCreditUser');
const tasks = require('../model/crm/tasks');
const CreateTask = require('../middleware/CreateTask');

const reyhamConcat = (osArray,odArray) =>{
    //console.log("ReyhamConcat")
    //console.log("odStock: ",odArray)
    var result = [];
    if(osArray.length===0&&odArray.length===0)return(result)
    //const brand = osArray[0]?osArray[0]:odArray[0];
    var osStockArray = JSON.stringify(osArray).replace(/sph/g,'osSPH');
        osStockArray = JSON.parse(osStockArray.replace(/cyl/g,'osCYL').replace(/price/g,'osPrice'));
        
    var odStockArray = JSON.stringify(odArray).replace(/sph/g,'odSPH');
        odStockArray = JSON.parse(odStockArray.replace(/cyl/g,'odCYL').replace(/price/g,'odPrice'));
        
    if(!osStockArray.length)return(odStockArray)
    if(!odStockArray.length)return(osStockArray)
    for(var i=0;i<osStockArray.length;i++){
        for(var j=0;j<odStockArray.length;j++){
            if(osStockArray[i].brandName === odStockArray[i].brandName&&
                osStockArray[i].material === odStockArray[i].material&&
                osStockArray[i].lenzIndex === odStockArray[i].lenzIndex&&
                osStockArray[i].coating === odStockArray[i].coating){
                const rep = result.find(item=>item.sku===osStockArray[i].sku+"|"+odStockArray[i].sku)
                !rep&&result.push({ 
                sku:osStockArray[i].sku+"|"+odStockArray[i].sku,
                hesabfa:osStockArray[i].hesabfa+"|"+odStockArray[i].hesabfa,
                brandName:osStockArray[i].brandName,
                material:osStockArray[i].material,
                lenzIndex:osStockArray[i].lenzIndex,
                coating:osStockArray[i].coating,
                
                osSPH:osStockArray[i].osSPH,
                osCYL:osStockArray[i].osCYL,
                osPrice:osStockArray[i].osPrice,

                odSPH:odStockArray[i].odSPH,
                odCYL:odStockArray[i].odCYL,
                odPrice:odStockArray[i].odPrice,
            
            })}
        }
    }
    return(result)
} 
router.post('/stock/list',jsonParser,async (req,res)=>{
    //console.log("StockListApi")
    try{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";

    const data={
        brand:req.body.brand,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        coating:req.body.coating,
        offset:req.body.page?req.body.page:0,

        align:req.body.align,
        price:req.body.price,
        
        
    } 
        //console.log(data.price[0]*10000)
        var sortPhrase=JSON.parse(
            `{"${req.body.sort?req.body.sort:"sku"}"
            :${req.body.sortAsc?1:-1}}`);
        const stockData = await sepidarstock
        .find(data.brand?{brandName:data.brand}:{})
        .find(data.lenzIndex?{lenzIndex:data.lenzIndex}:{})
        .find(data.material?{material:data.material}:{})
        .find(data.coating?{coating:data.coating}:{})
        .find(data.design?{design:data.design}:{})
        .find(data.price?{price:{$gte: data.price[0]*10000, $lte: data.price[1]*10000}}:{})
        //.find(data.price?{price:{$gte: data.price[0]*10000, $lte: data.price[1]*10000}}:{})
        
        const stockOffset = stockData.slice(data.offset,data.offset+10)   
       
        //console.log(data.offset)
        const brandList = [...new Set(stockData.map(item=>item.brandName))];
        //const brandList = await ManSchema.distinct('brandName')
        const lenzIndexList = [...new Set(stockData.map(item=>item.lenzIndex))];
        const materialList = [...new Set(stockData.map(item=>item.material))];
        const coatingList = [...new Set(stockData.map(item=>item.coating))];
        const designList = [...new Set(stockData.map(item=>item.design))];
        const alignList = [...new Set(stockData.map(item=>item.align))];
        
        
        res.json({stock:stockOffset,
            brandList:brandList,lenzIndexList:lenzIndexList,
            materialList:materialList,coatingList:coatingList,
            size:stockData.length,
            alignList:alignList,designList:designList
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
function isToday(date) {
    if(!date) return false;
    const today = new Date();
    if (today.toDateString() === date.toDateString()) {
      return true;
    }
    return false;
  }
router.post('/todayOrder',jsonParser,async (req,res)=>{
    //console.log("StockListApi")
    const data={
        offset:req.body.page?req.body.page:0,
        userId:req.body.userId
    } 
    try{
        var pageSize = req.body.pageSize?req.body.pageSize:"10";
        const userData = await userSchema.findOne({_id:data.userId})
        //console.log(userData)
        const stockData = await OrdersSchema.find({status:"inVehicle"})
            .find({group:userData.group})
        const todayData = stockData//.filter(item=>isToday(item.loadDate))
        //console.log(todayData)
        
        const stockOffset = todayData.slice(data.offset,data.offset+10)   
       
        res.json(stockOffset)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/stock/sku',jsonParser,async (req,res)=>{
    //console.log("StockSkuApi")
    try{
        const stockData = await sepidarstock
            .findOne({sku:req.body.sku})
        res.json(stockData)
    }
    catch(error){
        res.status(500).json({message: error})
    }
})
router.post('/stock/adminlist',jsonParser,async (req,res)=>{
    //console.log("StockAdminListApi")
    try{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    const data={
        brand:req.body.brand,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        coating:req.body.coating,
        offset:req.body.page,

        sph:req.body.sph,
        cyl:req.body.cyl,
        dia:req.body.dia,
        add:req.body.add,
        sphF:req.body.sphF?req.body.sphF:0,
        sphT:req.body.sphT,
        sphFix:req.body.sphFix,
        cylFix:req.body.cylFix,
        align:req.body.align,
        design:req.body.design,
        
    }
    var cylArr=[];
    for(var i=0;i<8;i++)
        cylArr.push(parseFloat(parseFloat(data.cyl)+.25*i).toFixed(2))
    
        var sortPhrase=JSON.parse(
            `{"${req.body.sort?req.body.sort:"sku"}"
            :${req.body.sortAsc?1:-1}}`);
        const stockData = await sepidarstock
        .find(data.brand?{brandName:data.brand}:{})
        .find(data.lenzIndex?{lenzIndex:data.lenzIndex}:{})
        .find(data.material?{material:data.material}:{})
        .find(data.coating?{coating:data.coating}:{})
        .find(data.dia?{dia:data.dia}:{})
        .find(data.add?{add:data.add}:{})
        .find(data.align?{align:data.align}:{})
        .find(data.design?{design:data.design}:{})
        .find(data.sphFix?{sph:data.sphFix}:{})
        .find(data.cylFix?{cyl:data.cylFix}:{})

        //.find(data.sph?{sph:{$in:data.sph}}:{})
        .find(data.cyl?{cyl:{$in:cylArr}}:{})
        .find(data.sphT&&{"sph" : {$ne: ""},"$expr" : 
            {$and:[{$lte: [ { $toDouble: "$sph" }, data.sphT ]}, 
                  {$gte: [ { $toDouble: "$sph" }, data.sphF ]}] }})
                  
    
    const pagingData = await sepidarstock
        .find(data.brand?{brandName:data.brand}:{})
        .find(data.lenzIndex?{lenzIndex:data.lenzIndex}:{})
        .find(data.material?{material:data.material}:{})
        .find(data.coating?{coating:data.coating}:{})
        .find(data.cyl?{cyl:{$in:cylArr}}:{})
        .find(data.dia?{dia:data.dia}:{})
        .find(data.add?{add:data.add}:{})
        .find(data.align?{align:data.align}:{})
        .find(data.design?{design:data.design}:{})
        .find(data.sphFix?{sph:data.sphFix}:{})
        .find(data.cylFix?{cyl:data.cylFix}:{})
        //.find(data.sphP?{sph:{$gt:"+5.25"}}:{})
        
        
        .find(data.sphT?{"sph" : {$ne: ""},"$expr" : 
            {$and:[{$lte: [ { $toDouble: "$sph" }, data.sphT ]}, 
                  {$gte: [ { $toDouble: "$sph" }, data.sphF ]}] }}:{})
        
        .sort(sortPhrase).skip(data.offset).limit(parseInt(pageSize))

        const brandList = [...new Set(stockData.map(item=>item.brandName))];
        //const brandList = await ManSchema.distinct('brandName')
        const lenzIndexList = [...new Set(stockData.map(item=>item.lenzIndex))];
        const materialList = [...new Set(stockData.map(item=>item.material))];
        const coatingList = [...new Set(stockData.map(item=>item.coating))];
        const skuList=stockData.map(item=>item.sku);
        
        const designList = [...new Set(stockData.map(item=>item.design))];
        const alignList = [...new Set(stockData.map(item=>item.align))];

        res.json({stock:pagingData,brandList:brandList,lenzIndexList:lenzIndexList,
            materialList:materialList,coatingList:coatingList,size:stockData.length,
            allStock:skuList,in:data, designList:designList,alignList:alignList
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/stock/add',jsonParser,async (req,res)=>{
    //console.log("StockAddApi")
    try{
    const data = {
        id:req.body.id,
        sku: req.body.sku,
        hesabfa: req.body.sku,
        od: req.body.od,
        count:req.body.count,
        sph:req.body.sph,
        cyl:req.body.cyl,
        dia:req.body.dia,
        add:req.body.add,
        design:req.body.design,
        align:req.body.align,

        brandName:req.body.brandName,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        coating:req.body.coating,

        price:req.body.price&&req.body.price.replace( /,/g, ''),
        discount:req.body.discount&&req.body.discount.replace( /,/g, ''),
        purchase:req.body.purchase&&req.body.purchase.replace( /,/g, ''),
    }
        //const existStock = await sepidarstock.find({_id:data.id});
        
        if(data.id){
            const stockData = await sepidarstock.updateOne({_id:data.id},{$set:data})
            res.json({stock:stockData,message:"update"})
        }
        else{
            const stockData = await sepidarstock.create(data)
            res.json({stock:stockData,message:"new"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/stock/remove',jsonParser,async (req,res)=>{
    //console.log("StockRemoveApi")
    const data = {
        id:req.body.id,
    }
    try{
        const existStock = await sepidarstock.deleteOne({_id:data.id});
        res.json({message:"deleted"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/stock/price',jsonParser,async (req,res)=>{
    //console.log("StockPriceApi")
    try{
        const stockData = await sepidarstock.updateMany({sku:{$in:req.body.sku}},{$set:{price:req.body.price}})
        res.json({stock:stockData,message:"update"})
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/stock/purchase',jsonParser,async (req,res)=>{
    //console.log("StockPurchaseApi")
    try{
        
        const stockData = await sepidarstock.updateMany({sku:{$in:req.body.sku}},{$set:{purchase:req.body.purchase}})
        res.json({stock:stockData,message:"update"})
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/stock/find',jsonParser,async (req,res)=>{
    //console.log("StockFindApi")
    try{
    const stockList = req.body.sku.split('|');
        const stockData = await sepidarstock.find({sku:{$in:stockList}});
        res.json(stockData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/manufacture/list',jsonParser,async (req,res)=>{
    //console.log("ManufactureListApi")
    const brandFilter=["ESSENCE","KODAK","MGMPlus","REVO"]
    try{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    const data={ 
        facoryName:req.body.facoryName,
        brand:req.body.brand,
        lenzType:req.body.lenzType,
        lenzDesign:req.body.lenzDesign,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        offset:req.body.page
    }
    const activeMan=await ManufactureStateSchema.find({state:"فعال"}).distinct("enTitle")
    
        var sortPhrase=JSON.parse(
            `{"${req.body.sort?req.body.sort:"sku"}"
            :${req.body.sortAsc?1:-1}}`);
        const manData = await ManSchema.find(!req.body.access?{active:{$not:/false/}}:{})
        .find(data.facoryName?{facoryName:data.facoryName}:
            req.body.access?{}:{
            facoryName : { $in: activeMan } 
        }) 
        .find(data.brand?{brandName:data.brand}:{brandName:{$in:brandFilter}})
        .find(data.lenzType?{lenzType:data.lenzType}:{})
        .find(data.lenzDesign?{lenzDesign:data.lenzDesign}:{})
        .find(data.lenzIndex?{lenzIndex:data.lenzIndex}:{})
        .find(data.material?{material:data.material}:{});
        const pageData = await ManSchema.find(!req.body.access?{active:{$not:/false/}}:{})
        .find(data.facoryName?{facoryName:data.facoryName}:
            req.body.access?{}:{
            facoryName : { $in: activeMan } 
        })
        .find(data.brand?{brandName:data.brand}:{})
        .find(data.lenzType?{lenzType:data.lenzType}:{})
        .find(data.lenzDesign?{lenzDesign:data.lenzDesign}:{})
        .find(data.lenzIndex?{lenzIndex:data.lenzIndex}:{})
        .find(data.material?{material:data.material}:{})
        .sort(sortPhrase).skip(data.offset).limit(parseInt(pageSize));
        const manufactureList = //req.body.access?
            [...new Set(manData.map(item=>item.facoryName))]
        const brandList = [...new Set(manData.map(item=>item.brandName))];
        //const brandList = await ManSchema.distinct('brandName')
        const lenzTypeList = [...new Set(manData.map(item=>item.lenzType))];
        const lenzDesignList = [...new Set(manData.map(item=>item.lenzDesign))];
        const lenzIndexList = [...new Set(manData.map(item=>item.lenzIndex))];
        const materialList = [...new Set(manData.map(item=>item.material))];
        const coridorList = [...new Set(manData.map(item=>item.coridor))];
        res.json({manData:pageData,manufacture:manufactureList,
            brandList:brandList,lenzType:lenzTypeList,
            lenzDesign:lenzDesignList,lenzIndex:lenzIndexList,
            material:materialList,coridor:coridorList,
            size:manData.length,rawData:manData,activeMan:activeMan
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/manufacture/listHesabfa',jsonParser,async (req,res)=>{
    //console.log("ManufactureListHesabFaApi")
    try{
        const manData = await ManSchema.find() 
        
        res.json({data:manData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/manufacture/find',jsonParser,async (req,res)=>{
    //console.log("ManufactureFindApi")
    try{
        const manData = await ManSchema.findOne({sku:req.body.sku});
        res.json(manData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/manufacture/add',jsonParser,async (req,res)=>{
    //console.log("ManufactureAddApi")
    try{
    const data = {
        //sku: req.body.sku,
        id:req.body.id,
        facoryName:req.body.facoryName,
        brandName:req.body.brandName,
        lenzIndex:req.body.lenzIndex,
        material:req.body.material,
        lenzType:req.body.lenzType,
        lenzDesign:req.body.lenzDesign,
        coridor:req.body.coridor,
        active:req.body.active,
        lenzPrice:req.body.lenzPrice&&req.body.lenzPrice.replace( /,/g, ''),
        lenzDiscount:req.body.lenzDiscount&&req.body.lenzDiscount.replace( /,/g, ''),
        lenzPurchase:req.body.lenzPurchase&&req.body.lenzPurchase.replace( /,/g, ''),
    }
    const existMan = await ManSchema.find({_id:data.id});
    const brandOff = await brand.find();
    const off = brandOff.find(item=>item.enTitle===(data.brandName?data.brandName:existMan[0].brandName))
    var saveHesabFa={}
    const lensTitle=data.brandName+" "+data.lenzIndex+" "+data.material+" "+
                data.lenzDesign+" "+data.lenzType
    //console.log(data.active) 
        if(existMan.length){
            const manData = await ManSchema.updateOne({_id:req.body.id},{$set:data})
            saveHesabFa = await HesabFaApiCall("/item/save",{item:{
                Name:lensTitle,
                ProductCode:existMan[0].sku,
                Barcode:existMan[0].sku,
                Code:existMan[0].hesabfa,
                BuyPrice:existMan[0].lenzPrice*(off&&off.purchase?(100-off&&off.purchase)/100:.9),
                SellPrice:existMan[0].lenzPrice
            }
            })
            res.json({manufacture:manData,message:"update",saveHesabFa:saveHesabFa})
        }
        else{
            if(req.body.sku){
                const oldData = await ManSchema.find({sku:req.body.sku})
            
                if(oldData.length){
                    res.json({error: "شناسه محصول تکراری است"})
                    return;
                }
                hesabFa =await HesabFaApiCall("/item/save",{item:{
                    Name:lensTitle,
                    ItemType: 0,
                    ProductCode:req.body.sku,
                    Barcode:req.body.sku,
                    BuyPrice:data.lenzPrice*(off&&off.purchase?(100-off&&off.purchase)/100:.9),
                    SellPrice:data.lenzPrice
                }
                })
                //console.log(hesabFa.Result.Code)
                const manData = await ManSchema.create(
                    {...data,title:lensTitle,sku:req.body.sku,hesabfa:hesabFa.Result.Code})
                res.json({manufacture:manData,message:"new"})
            }
            else{
                var lastItem = await ManSchema.findOne().sort({"sku":-1})
                var lastSku = (parseInt(lastItem.sku)+1).toString();

                const hesabFa =await HesabFaApiCall("/item/save",{item:{
                    Name:lensTitle,
                    ItemType: 0,
                    ProductCode:lastSku,
                    Barcode:lastSku,
                    BuyPrice:data.lenzPrice*(off&&off.purchase?(100-off&&off.purchase)/100:.9),
                    SellPrice:data.lenzPrice
                }
                })
                const manData = await ManSchema.create({...data,sku:lastSku,hesabfa:hesabFa.Result.Code})
                res.json({manufacture:manData,message:lastSku +" created"}) 
            }

        } 
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/manufacture/priceAll',jsonParser,async (req,res)=>{
    //console.log("ManufacturePriceAllApi")
    const data = req.body.data
    var updateBody = []
    const brandOff = await brand.find();
    
    try{
        for(var i =0;i<data.length;i++){
            const off = brandOff.find(item=>item.enTitle===data[i][3])
            const rxData = await ManSchema.updateOne({sku:data[i][0]},
                {$set:{lenzPrice:parseInt(data[i][1].replace( /,/g, ''))}})
            if(data[i][2])
            updateBody.push({
                Code:data[i][2],
                BuyPrice:parseInt(data[i][1].replace( /,/g, ''))*(off&&off.purchase?(100-off&&off.purchase)/100:.9),
                SellPrice:parseInt(data[i][1].replace( /,/g, '')),

            })
            
        }
        //console.log(updateBody,data)
        const hesabFaUpdate =  HesabFaApiCall("/item/batchsave",{items:updateBody})
        res.json({rx:data,message:"item updated",saveHesabFa : hesabFaUpdate})
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


router.get('/color',async (req,res)=>{
    //console.log("ColorApi")
    try{
        const colorData = await ColorSchema.find().sort({"sort":1});
        const mirrorData = await MirrorSchema.find().sort({"sort":1});
        const coverData = await CoverSchema.find().sort({"sort":1});
        const xtraData = await XtraSchema.find()
        res.json({color:colorData,mirror:mirrorData,cover:coverData,xtra:xtraData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/params',async (req,res)=>{
    //console.log("ParamsApi")
    try{
        const paramData = await param.find()
        res.json(paramData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/addItem',jsonParser, auth,async (req,res)=>{
    //console.log("AddItemApi")
    try{const data = {
        id:req.body.id, 
        userId:req.headers["userid"],
        manageId:req.headers["manageId"],
        stockId: req.body.stockId,
        stockOrderNo: req.body.stockOrderNo,

        stockOrderPrice: req.body.stockOrderPrice,
        stockFaktor: req.body.stockFaktor,
        
        status:req.body.status,
        date: Date.now()
    } 
    const stockData = await lenzStockSchema.findOne({_id:data.stockId});
    const price={
        extraPrice:SumPrices([data.framePrice,data.colorPrice,
                   data.coverPrice,data.mirrorPrice]),
        lenzPrice:SumPrices([stockData.priceOD,stockData.priceOS]),
        totalDiscount:stockData.discountOS,
        
    }
    const totalPrice=SumPrices([price.extraPrice,price.lenzPrice,-price.totalDiscount]);

        const existOrderItem = await OrdersSchema.find({_id:data.id});
        if(existOrderItem.length){
            const orderData = await OrdersSchema.updateOne({_id:data.id},{$set:data})
            res.json({order:orderData,message:"update"})
        }
        else{
            const orderData = await OrdersSchema.create({...data,...price,totalPrice:totalPrice})
            res.json({order:orderData,message:"new"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/updateItem',jsonParser, auth,async (req,res)=>{
    //console.log("UpdateItemApi")
    try{
    const data = {
        status:req.body.status,
    } 
        const orderData = await OrdersSchema.updateOne({_id:req.body.id},{$set:data})
            res.json({order:orderData,message:"update"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

const checkRep=async(userNo,dateYear)=>{
    var rxTemp = '';
    while(1){
        
        const foundRx = rxTemp&&await OrdersSchema.findOne({stockOrderNo:rxTemp});
        if(rxTemp&&!foundRx)break
        else rxTemp=userNo+
            (Math.floor(Math.random() * 1000000) + 100000)
    }
    return(rxTemp)

}
const faNumtoEn=(faNum)=>{
    var outPut = ''
    const faDigits = ['۱','۲','۳','۴','۵','۶','۷','۸','۹','۰'];
    const enDigits = ['1','2','3','4','5','6','7','8','9','0'];
    for(index=0;faDigits.length;index++)
        if(faDigits[index]===faNum)
            return(enDigits[index])
    return(0)
}
router.post('/addrx',jsonParser, auth,async (req,res)=>{
    //console.log("AddRXApi")
    try{
        const data = {
            id:req.body.id,
            userId:req.headers["userid"],
            manageId:req.headers["manageId"],
            consumer: req.body.consumer,
            brand: req.body.brand,
            rxLenz: req.body.rxLenz,
            //rxOrderNo:req.body.rxOrderNo,
            rxFaktorNo:req.body.rxFaktorNo,
            lastIndex:req.body.lastIndex,
            lenzDid:req.body.lenzDid,
            odMain:req.body.odMain,
            odMore:req.body.odMore,
            
            osMore:req.body.osMore,
            osMain:req.body.osMain,
            copyLeftRight:req.body.copyLeftRight,
            singleLens:req.body.singleLens,

            frameSize:req.body.frameSize,
            frameType:req.body.frameType,
            frameImg:req.body.frameImg,

            colorCode:req.body.colorCode,
            colorPrice:req.body.colorPrice,

            coverCode:req.body.coverCode,
            coverPrice:req.body.coverPrice,
            coridor:req.body.coridor,

            mirrorCode:req.body.mirrorCode,
            mirrorPrice:req.body.mirrorPrice,

            lanti:req.body.lanti,
            NazokTigh:req.body.NazokTigh,
            NazokTighPrice:req.body.NazokTighPrice,
            extraInformation:req.body.extraInformation,
            viewValue:req.body.viewValue,
            studyDistance:req.body.studyDistance,
            job:req.body.job,
            moreInformation:req.body.moreInformation,
            
            expressPrice:req.body.expressPrice,
            totalPrice:req.body.totalPrice,
            totalDiscount:req.body.totalDiscount,
            status:req.body.status,
            date: Date.now()
        }
        const userData = await user.findOne({_id:data.userId})
        const existOrderItem = await RXSchema.findOne({userId:data.userId,status:"initial"});
        const dateNow = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });;
        if(existOrderItem){
            var rxData = '';
            if(data.status === "inprogress"){
                const orderNo = await checkRep(userData.cCode&&userData.cCode.replace( /^\D+/g, ''),
                dateNow.split('/')[0])
                //console.log({...data,rxOrderNo:"orderNo"})
                var errors=0
                if(!existOrderItem.brand)errors=1
                if(!existOrderItem.odMain&&!existOrderItem.osMain)errors=2
                if(!existOrderItem.coverCode)errors=3
                if(!errors){rxData = await RXSchema.updateOne({userId:data.userId,status:"initial"},
                            {$set:{...data,rxOrderNo:orderNo}})
                await sendSmsUser(data.userId,process.env.regOrder,orderNo,"rxOrderNo",data.status)
                await orderLogSchema.create({status:data.status,rxOrderNo:data.rxOrderNo,date:Date.now()})}
                res.json({rx:rxData,message:!errors?"done":errors,new:1})
            }
            else{
                rxData = await RXSchema.updateOne({userId:data.userId,status:"initial"},{$set:data})
                res.json({rx:rxData,message:"done"})
            }
            //
            
        } 
        if(!existOrderItem){
            //data.rxOrderNo = await checkRep(data.rxOrderNo)
            const rxData = await RXSchema.create(data)
            res.json({rx:rxData,message:"new order"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/addstock',jsonParser, auth,async (req,res)=>{
    //console.log("AddStockApi")
    const fromUser = req.body.fromUser;
    try{
        const orderNo = await checkRep(fromUser?"Mf":"Mc");
       
    const data = {
        userId:fromUser?fromUser:req.headers["userid"],
        stockOrderNo:orderNo,
        stockOrderPrice:req.body.stockOrderPrice,
        stockFaktor:req.body.stockFaktor,
        description:req.body.description,
        freeCredit:req.body.freeCredit,
        credit:req.body.credit,
        stockFaktorOrg:req.body.stockFaktor,
        status:req.body.status,
        date: Date.now(),
        loadDate:new Date(req.body.loadDate),
        loadDateOrg:new Date(req.body.loadDate)
    } 
    const userData = await userSchema.findOne({_id:data.userId})
    var credit = userData.profile==="659b9ce3d9c3154d2f94a82e"?
    await calcCreditUser(userData):{credit:1}
    //console.log(credit)
    if(!credit||credit.credit<1){
        res.json({error:`مشتری گرامی<br/>
        اعتبار: ${credit.remainCredit}<br/>
        FOB: ${credit.remainFob}<br/>
        کسری اعتبار: ${credit.credit*-1}<br/>
        لطفا نسبت ایجاد تراکنش به صورت یارانه ای و یا غیر یارانه ای به میزان 
        ${credit.credit*-1} اقدام نمایید`
        ,errorTitle:"اعتبار کافی نیست"})
        return
    }
    data.group = userData.group
    //console.log(data)

        try{const taskData = await CreateTask("order",data)} catch{}
        const stockData = await OrdersSchema.create(data)//{_id:req.body.id},{$set:data})
        await sendSmsUser(data.userId,process.env.regOrder,".","rxOrderNo",data.status)
        res.json({stock:stockData,task:taskData,message:"order register"})

    
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/rxList',jsonParser,auth,async(req,res)=>{
    //console.log("RXListApi")
    try{
        const rxData = await RXSchema.find({ userId:req.headers["userid"]});
        const stockData = await OrdersSchema.find({ userId:req.headers["userid"]});
        const userData = await userInfo.findOne({userId:req.headers['userid']})
        const userRaw = await userSchema.findOne({_id:req.headers['userid']})
        res.json({rxData:rxData,stockData:stockData,userInfo:userData,userRaw:userRaw})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/rxListAll',jsonParser,async(req,res)=>{
    //console.log("RXListApi")
    try{
    var time = (new Date(Date.now())).getHours();
    
        const userData = await userSchema.findOne({_id:req.headers['userid']})
        
        const rxData = await RXSchema.find();
        const stockData = (userData.access==="manager"||(time<17&&time>7))?
            await OrdersSchema.find():'';
        
        //console.log(userData)
        res.json({rxData:rxData,stockData:stockData,userInfo:userData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/rxSeprate',jsonParser,async(req,res)=>{
    //console.log("RXSeprateApi")
    
    try{
    var time = (new Date(Date.now())).getHours();
        
        const userData = await userSchema.findOne({_id:req.headers['userid']})
        const access = userData.access
        const rxDataInitial = await RXSchema.find({status:"initial"}).count();
        const rxDataInprogress = await RXSchema.find({status:"inprogress"}).count();
        const rxDataAccepted = await RXSchema.find({status:"accept"}).count();
        const rxDataInproduction = await RXSchema.find({status:"inproduction"}).count();
        const rxDataFaktor = await RXSchema.find({status:"faktor"}).count();
        const rxDataSending = await RXSchema.find({status:"sending"}).count();
        const rxDataDelivered = await RXSchema.find({status:"delivered"}).count();
        const rxDataStoreSent = await RXSchema.find({status:"storeSent"}).count();
        const rxDataCompleted = access==="manager"? await RXSchema.find({status:"completed"}).count():"-";
        const rxDataCancel = await RXSchema.find({status:/cancel/}).count();
        const rxDataHold = await RXSchema.find({status:"hold"}).count();

        
        //console.log(userData)
        res.json({rxDataInitial:rxDataInitial,
            rxDataInprogress:rxDataInprogress,
            rxDataAccepted:rxDataAccepted,
            rxDataInproduction:rxDataInproduction,
            rxDataFaktor:rxDataFaktor,
            rxDataSending:rxDataSending,
            rxDataDelivered:rxDataDelivered,
            rxDataStoreSent:rxDataStoreSent,
            rxDataCompleted:rxDataCompleted,
            rxDataCancel:rxDataCancel,
            rxDataHold:rxDataHold,
        userInfo:userData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/rxSeprateCustomer',jsonParser,async(req,res)=>{
    //console.log("rxSeprateCustomerApi")
    try{ 
        const rxDataInitial = await RXSchema.find({status:"initial",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataInprogress = await RXSchema.find({status:"inprogress",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataAccepted = await RXSchema.find({status:"accept",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataInproduction = await RXSchema.find({status:"inproduction",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataFaktor = await RXSchema.find({status:"faktor",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataSending = await RXSchema.find({status:"sending",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataDelivered = await RXSchema.find({status:"delivered",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataStoreSent = await RXSchema.find({status:"storeSent",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataCompleted = await RXSchema.find({status:"completed",userId:ObjectID(req.headers["userid"])}).count();
        const rxDataCancel = await RXSchema.find({status:/cancel/,userId:ObjectID(req.headers["userid"])}).count();
        const rxDataHold = await RXSchema.find({status:"hold",userId:ObjectID(req.headers["userid"])}).count();

        
        //console.log(userData)
        res.json({rxDataInitial:rxDataInitial,
            rxDataInprogress:rxDataInprogress,
            rxDataAccepted:rxDataAccepted,
            rxDataInproduction:rxDataInproduction,
            rxDataFaktor:rxDataFaktor,
            rxDataSending:rxDataSending,
            rxDataDelivered:rxDataDelivered,
            rxDataStoreSent:rxDataStoreSent,
            rxDataCompleted:rxDataCompleted,
            rxDataCancel:rxDataCancel,
            rxDataHold:rxDataHold})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/rxSeprate/search',jsonParser,async(req,res)=>{
    //console.log("RxSeprateSearchApi")
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    const search = req.body.search?req.body.search:'';
    try{
        const rxData = req.body.userId?await 
         RXSchema.find({status:{$regex:req.body.status},
            rxOrderNo:{$regex: search},
            userId:ObjectID(req.body.userId)}):
          await RXSchema.find({status:{$regex:req.body.status},
            rxOrderNo:{$regex: search}})
        .skip(req.body.offset).limit(parseInt(pageSize))
        
        //console.log(userData)
        res.json(rxData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/stockSeprate',jsonParser,async(req,res)=>{
    //console.log("StockSeprateApi") 
    const access = req.body.access
    try{
    var time = (new Date(Date.now())).getHours();
        
        const userData = await userSchema.findOne({_id:req.headers['userid']})
        if(!userData)
            res.status(500).json({message: "user not found"})
        const stockDataInprogress = await OrdersSchema.find({status:"inprogress",group:userData.group}).count();
        const stockDataAccepted = await OrdersSchema.find({status:"accept",group:userData.group}).count();
        //const stockDataDelivered = await OrdersSchema.find({status:"delivered"}).count();
        const stockDataInVehicle = await OrdersSchema.find({status:"inVehicle",group:userData.group}).count();
        const stockDataSaleControl = await OrdersSchema.find({status:"saleControl",group:userData.group}).count();
        const stockDataOutVehicle = await OrdersSchema.find({status:"outVehicle",group:userData.group}).count();
        
        const stockDataCompleted = await OrdersSchema.find({status:"completed",group:userData.group}).count();
        const stockDataCancel = await OrdersSchema.find({status:/cancel/,group:userData.group}).count();

        
        //console.log(userData)
        res.json({stockDataInprogress:stockDataInprogress,
            stockDataAccepted:stockDataAccepted,
            stockDataInVehicle:stockDataInVehicle,
            stockDataSaleControl:stockDataSaleControl,
            stockDataOutVehicle:stockDataOutVehicle,
            stockDataCompleted:stockDataCompleted,
            stockDataCancel:stockDataCancel,
        userInfo:userData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/stockSeprateCustomer',jsonParser,async(req,res)=>{
    //console.log("rxSeprateCustomerApi")
    try{
        const stockDataInprogress = await OrdersSchema.find({status:"inprogress",userId:ObjectID(req.headers["userid"])}).count();
        const stockDataAccepted = await OrdersSchema.find({status:"accept",userId:ObjectID(req.headers["userid"])}).count();
        const stockDataInVehicle = await OrdersSchema.find({status:"inVehicle",userId:ObjectID(req.headers["userid"])}).count();
        const stockDataSaleControl = await OrdersSchema.find({status:"saleControl",userId:ObjectID(req.headers["userid"])}).count();
        const stockDataOutVehicle = await OrdersSchema.find({status:"outVehicle",userId:ObjectID(req.headers["userid"])}).count();
        const stockDataCompleted = await OrdersSchema.find({status:"completed",userId:ObjectID(req.headers["userid"])}).count();
        const stockDataCancel = await OrdersSchema.find({status:/cancel/,userId:ObjectID(req.headers["userid"])}).count();
        
        //console.log(userData)
        res.json({stockDataInprogress:stockDataInprogress,
            stockDataAccepted:stockDataAccepted,
            stockDataInVehicle:stockDataInVehicle,
            stockDataSaleControl:stockDataSaleControl,
            stockDataOutVehicle:stockDataOutVehicle,
            stockDataCompleted:stockDataCompleted,
            stockDataCancel:stockDataCancel})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/stockSeprate/search',jsonParser,async(req,res)=>{
    //console.log("StockSeprateSearchApi")
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    const search = req.body.search?req.body.search:'';
    const all = req.body.all;
    try{ 
        if(search.length<5&&!all){res.json([]); return;}
        const filterUser = await userSchema.find({cName:{$regex:search}})
        
        var userFilterList = [];
        for(var i=0;i<filterUser.length;i++){
            userFilterList[i]=ObjectID((filterUser[i]._id).toString())
        }
        //console.log(userFilterList)
        const stockData = req.body.userId?await 
         OrdersSchema.find({status:{$regex:req.body.status},
            stockOrderNo:{$regex: search},
            userId:ObjectID(req.body.userId)}):
          await OrdersSchema.find({status:{$regex:req.body.status},
            stockOrderNo:{$regex: search}})
            //.find(userFilterList.length&&{userId:{$in:userFilterList}})
            //.find(search&&!userFilterList.length&&{stockOrderNo:{$regex: search}})
            .find(req.body.group?{group:req.body.group}:{})
        .skip(req.body.offset).limit(parseInt(pageSize))
        
        //console.log(userData)
        res.json(stockData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


router.post('/rxKharid/search',jsonParser,async(req,res)=>{
    //console.log("RxKharidSearchApi")
    const search = req.body.search?req.body.search:'';
    try{
        const rxData = await RXSchema//.find({$or:[{status:"sending"},{status:"faktor"}]}).
            .find({rxOrderNo:{$regex: search}})
        if(rxData&&!rxData.length){
            res.status(500).json({error: "شماره سفارش موجود نیست" })
            return;
        }
        if((rxData[0].status==="sending"||rxData[0].status==="faktor"))
            res.json(rxData)
        //console.log(userData)
        else
            res.status(500).json({error: rxData[0].status })
        
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})
router.post('/rxSuspend',jsonParser,async(req,res)=>{
    try{
        const rxData = await RXSchema.find({status:/suspend/})
         res.json(rxData)
                
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

function findServices(rxList,productCode,Discount){
    //console.log(rxList)
    var rxServices =[]
    if(!rxList)return 0;
    var quantity=1;
    try{quantity=(rxList.odMain.split(',')[0]&&rxList.osMain.split(',')[0])?2:1}
    catch{}
    rxServices.push({
        RowNumber: 1,
        Description: productCode&&productCode.title,
        productCode:rxList.rxLenz&&rxList.rxLenz.split(',')[2],
        ItemCode: productCode&&productCode.hesabfa,//existOrderItem.rxLenz.split(',')[2],
        Unit: 'لنگه',
        Discount:disPrice(rxList.rxLenz&&rxList.rxLenz.split(',')[0],
                            Discount,quantity),
        Quantity: quantity,
        UnitPrice: rxList.rxLenz&&rxList.rxLenz.split(',')[0],
    })
    if(rxList.colorCode)rxServices.push({
        Description:"کد رنگ: "+rxList.colorCode,
        ItemCode: "500002",
        Quantity:1,
        Discount:disPrice(rxList.colorPrice,Discount),
        UnitPrice:rxList.colorPrice
    }) 
    if(rxList.mirrorCode)rxServices.push({
        Description:"کد میرور: "+rxList.mirrorCode,
        ItemCode: "500003",
        Quantity:1,
        Discount:disPrice(rxList.mirrorPrice,Discount),
        UnitPrice:rxList.mirrorPrice
    })
    if(rxList.coverCode)rxServices.push({
        Description:"پوشش: "+rxList.coverCode,
        ItemCode: "500001",
        Quantity:1,
        Discount:disPrice(rxList.coverPrice,Discount),
        UnitPrice:rxList.coverPrice
    }) 
    if(rxList.NazokTigh)rxServices.push({
        Description:"خدمات بیشتر: "+rxList.NazokTigh,
        ItemCode: "500004",
        Quantity:1,
        Discount:disPrice(rxList.NazokTighPrice,Discount),
        UnitPrice:rxList.NazokTighPrice
    })
    return(rxServices)
}
const disPrice=(price,discount,quantity)=>{
    if(!discount)return(0)
    if(!price)return(0)
    else{
        return((price.replace( /,/g, '')*(parseInt(discount.split('%')[0])))
        *(quantity?quantity:1)/100)
    }
}
router.post('/manage/addrx',jsonParser, auth,async (req,res)=>{
    //console.log("ManageAddRxApi")
        var data = {
            status:req.body.status,
            progressDate: Date.now()
        } 
        const rx = await RXSchema.find({rxOrderNo:req.body.rxOrderNo})
        //console.log(rx)
        if(rx.length>1) {
            res.status(500).json({error: "کد سفارش تکراری است، لطفا با پشتیبانی تماس بگیرید"})
            return; 
        }
    try{    
        const userData = await userSchema.findOne({_id:rx[0].userId})
        const adminData = await userSchema.findOne({_id:req.headers["userid"]})
        const productCode = await ManSchema.findOne({sku:rx[0].rxLenz&&rx[0].rxLenz.split(',')[2]})
        //console.log(data.status,req.body.rxOrderNo) R22826
        
        //console.log("CCode: "+userData.cCode+ " Phone: " + userData.phone)
        var setFaktor = {}
        var rxData ={}
        if(data.status === "initial"){
            data = {...data, rxOrderNo:""}
        } 
        if(data.status === "accept")
            userData&&await sendSmsUser(userData._id,process.env.acceptOrder,req.body.rxOrderNo,"rxOrder",data.status)
        if(data.status === "completed") 
            //userData&&await sendSmsUser(userData._id,process.env.sendOrder,req.body.rxOrderNo,"rxOrder",data.status)
        if(data.status ==="delivered"){
            //console.log(userData.cCode)
            //console.log(findServices(rx,productCode,rx.totalDiscount))
            setFaktor =await HesabFaApiCall("/invoice/save",{invoice:{
                Date: new Date(Date.now()),
                DueDate: new Date(Date.now()),
                ContactCode: userData&&userData.cCode&&userData.cCode.replace( /^\D+/g, ''),
                ContactTitle: userData&&userData.cName,
                Reference:rx[0].rxOrderNo, 
                InvoiceType: 0, 
                Status: 2,
                InvoiceItems: findServices(rx[0],productCode,rx[0].totalDiscount)
            }}) 
            //console.log(findServices(rx,productCode,rx.totalDiscount))
            if(setFaktor.Success){
                await RXSchema.updateOne({
                rxOrderNo:req.body.rxOrderNo},{$set:data})}
            else{
                //console.log(setFaktor)
                var errorOut = "خطایی رخ داده است";
                if(setFaktor.errno)
                    errorOut="خطا در ارتباط با حسابفا";
                if(setFaktor.ErrorCode===112)
                    errorOut="کد کالا در حسابفا مغایرت دارد"
                if(setFaktor.ErrorCode===104)
                    errorOut="کد مشتری در حسابفا مغایرت دارد"
                await RXSchema.updateOne({
                        rxOrderNo:req.body.rxOrderNo},{$set:{status:("suspend|"+errorOut)}})
                res.status(500).json({error: errorOut,errorDetail:setFaktor});
                return
            }
        } 
        rxData = (data.status!=="delivered")&&
            await RXSchema.updateOne({
            rxOrderNo:req.body.rxOrderNo},{$set:data})
        await orderLogSchema.create({status:data.status,rxOrderNo:req.body.rxOrderNo,date:Date.now(),user:adminData.phone})
         res.json({rx:rxData,message:"update",setFaktor:setFaktor})
    } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})
const calcWeight=async(order)=>{
    var totalWeight =  0;
    for(var i = 0;i<order.stockFaktor.length;i++)
    {
        const skuFind = await sepidarstock.findOne({sku:order.stockFaktor[i].sku})
        totalWeight+=(parseInt(skuFind.design.replace(/\D/g,''))*order.stockFaktor[i].count);
        
    }
    //console.log(order)
    return (totalWeight)
}
router.post('/manage/addstock',jsonParser, auth,async (req,res)=>{
    //console.log("ManageAddStockApi")
    try{
    const data = {
        status:req.body.status,
        carNo:req.body.carNo,
        description:req.body.description,
        ghabzIn:req.body.ghabzIn,
        ghabzOut:req.body.ghabzOut,
        cert:req.body.cert,
        progressDate: Date.now()
    } 
    const adminData = await userSchema.findOne({_id:req.headers["userid"]})
    const oldStockData = await OrdersSchema.findOne({stockOrderNo:req.body.stockOrderNo})
    const userData = await userSchema.findOne({_id:oldStockData.userId})
    const ldDate =oldStockData.loadDate.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })
    
    //await calcWeight(oldStockData)
    var stockData = ''
    try{ 
    if(data.status==="inVehicle"){
        const smsResult = await sendSmsUser(userData._id,process.env.acceptOrder,
            req.body.stockOrderNo,ldDate.split(' ')[0],await calcWeight(oldStockData))
        //console.log("result:","smsResult")
    }
    if(data.status==="outVehicle"){
        const smsResult = await sendSmsUser(userData._id,process.env.sendOrder,
            req.body.stockOrderNo,"token2")
        //console.log(smsResult)
    } 
    if(data.status.includes("cancel")){
        const newUserLog = await logSchema.create({
            title: "لغو سفارش",
            user: userData._id,
            kind:"customer",
            description: "سفارش با شماره "+req.body.stockOrderNo+
             " لغو شده است ",
            status: "unread",
            date:Date.now()
          })
        const smsResult = await sendSmsUser(userData._id,process.env.cancelOrder,
            req.body.stockOrderNo,"token2")
        //console.log(smsResult)
    }
}catch{}
    stockData = await OrdersSchema.updateOne({
        stockOrderNo:req.body.stockOrderNo},{$set:data});
        await tasks.updateOne({orderNo:req.body.stockOrderNo},
            {$set:{taskStep:data.status}})
    await orderLogSchema.create({status:data.status,rxOrderNo:req.body.stockOrderNo,
        date:Date.now(),user:adminData.phone})
        res.json({stock:stockData,message:"update"})
    } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})
const calcTotal= async(listArray)=>{
    var totalPrice = 0;
    for(var i=0;i<listArray.length;i++){
        try{totalPrice+= parseInt(listArray[i].price) * parseInt(listArray[i].count)}
        catch{}
    }
    return(totalPrice)
}
router.post('/manage/editstock',jsonParser, auth,async (req,res)=>{
    //console.log("ManageAddStockApi")
    try{
    const data = {
        newItem:req.body.newItem,
        oldID:req.body.oldID
    } 
    const oldStockData = await OrdersSchema.findOne({stockOrderNo:req.body.stockOrderNo})
    var stockFaktor = oldStockData.stockFaktor;
    //console.log(stockFaktor)
    
    if(data.newItem){
        if(data.oldID){
            for(var index=0;index<stockFaktor.length;index++)
            {
                if(stockFaktor[index].sku===data.oldID){
                    stockFaktor[index]=data.newItem
                    break
                }
            } 
        }
        else{
            stockFaktor.push(data.newItem)  
        }
    }
    else{
        for(var index=0;index<stockFaktor.length;index++)
            {
                if(stockFaktor[index].sku===data.oldID){
                    stockFaktor.splice(index, 1);
                    break
                }
            }

    }
    const totalPrice = await calcTotal(stockFaktor)
    //console.log(stockFaktor)
    //const userData = await userSchema.findOne({_id:oldStockData.userId})
    //console.log(oldStockData)
    var stockData = await OrdersSchema.updateOne({
        stockOrderNo:req.body.stockOrderNo},
        {$set:{stockFaktor:stockFaktor,stockOrderPrice:totalPrice}})
    const newStockData = await OrdersSchema.findOne({stockOrderNo:req.body.stockOrderNo})
        res.json({stock:newStockData,message:"update"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/manage/editDate',jsonParser, auth,async (req,res)=>{
    //console.log("ManageAddStockApi")
    try{
    const data = {
        loadDate:req.body.loadDate
    } 
    const oldStockData = await OrdersSchema.updateOne({stockOrderNo:req.body.stockOrderNo},
        {$set:data})
    res.json({stock:oldStockData,message:"update Date"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/manage/rxList',jsonParser,auth,async(req,res)=>{
    //console.log("ManagerRxListApi")
    try{
        const inprogressList = await RXSchema.find({ status:"inprogress"});
        const acceptList = await RXSchema.find({ status:"accept"});
        const inproductionList = await RXSchema.find({ status:"inproduction"});
        const faktorList = await RXSchema.find({ status:"faktor"});
        const sendingList = await RXSchema.find({ status:"sending"});
        const deliveredList = await RXSchema.find({ status:"delivered"});
        const sentStoreList = await RXSchema.find({ status:"sentStore"});
        const cancelList = await RXSchema.find({ status:{$regex :"cancel"}});
        
        const userData = await userSchema.findOne({_id:req.headers['userid']})
        res.json({inprogress:inprogressList,accept:acceptList,
            inproduction:inproductionList,faktor:faktorList,sending:sendingList,
            delivered:deliveredList,cancel:cancelList,sentStore:sentStoreList,
        userInfo:userData})
    }
    catch{
        res.status(500).json({message: error.message})
    }
})

router.post('/addKharid',jsonParser, auth,async (req,res)=>{
    //console.log("AddKharidApi")
    try{
    const data = { 
        id:req.body.id,
        rxLenz: req.body.rxLenz,
        rxCount: req.body.rxCount,
        rxOrderNo:req.body.rxOrderNo,
        rxFaktorNo:req.body.rxFaktorNo,
        rxFaktorName:req.body.rxFaktorName,

        date: Date.now()
    } 
        const existKharidItem = await KharidSchema.findOne({rxLenz:data.rxLenz,rxFaktorNo:data.rxFaktorNo});
        
        if(existKharidItem){
            
            res.json({message:"error"})
        }
        else{
            const rxKharid = await KharidSchema.create(data)
            res.json({Kharid:rxKharid,message:"new"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/kharidList', auth,async(req,res)=>{
    //console.log("KharidListApi")
    try{
        const kharidList = await KharidSchema.find();
        res.json(kharidList)
    }
    catch{
        res.status(500).json({message: error.message})
    }
})

router.post('/fetch-order',jsonParser, async (req,res)=>{
    //console.log("FetchOrderApi")
    const data = {
        rxOrderNo: req.body.rxOrderNo,
    } 
    try{
        const existOrder = await RXSchema.findOne({rxOrderNo:data.rxOrderNo});
        
        if(existOrder){
            
            res.json(existOrder)
        }
        else{
            res.status(500).json({message: "not found"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/fetch-stock',jsonParser, async (req,res)=>{
    //console.log("FetchStockApi")
    const data = {
        stockOrderNo: req.body.stockOrderNo,
    } 
    try{
        const existOrder = await OrdersSchema.findOne({stockOrderNo:data.stockOrderNo}).lean();
        var stockList = existOrder.stockFaktor
        const userDetail = await userSchema.findOne({_id:ObjectID(existOrder.userId)})
        existOrder.userDetail = userDetail
        for(var i =0;i<stockList.length;i++){
            var stockDetail = await sepidarstock.findOne({sku:stockList[i].sku});
            existOrder.stockFaktor[i].stockDetail = stockDetail
        } 
        const taskData = await tasks.findOne({orderNo:data.stockOrderNo})
        if(existOrder){
            res.json({...existOrder,userDetail,taskId:taskData&&taskData._id})
        }
        else{
            res.status(500).json({message: "not found"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/cart', auth,async (req,res)=>{
    //console.log("CartApi")
    try{
        const cartData = await Cart.aggregate([
            { $match : { userId : ObjectID(req.headers["userid"]) } },
            {$lookup:{
                from : "stocks", 
                localField: "sku", 
                foreignField: "_id", 
                as : "stockDetail"
            }},
        ])
        const cartDetail = await cartCreator(req.headers["userid"])
        var totalPrice = "0";
        var totalDiscount = "0";
        for(var indx=0;indx<cartData.length;indx++){
            totalPrice= SumPrices([totalPrice,cartData[indx].totalPrice])
            totalDiscount=SumPrices([totalDiscount,cartData[indx].totalDiscount])
        }
        res.json({cart:{items:cartDetail,totalPrice:totalPrice,totalDiscount:totalDiscount,orderId:"MGM1401"+Date.now()}})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/cartOld', auth,async (req,res)=>{
    //console.log("CartApi")
    try{
        const cartData = await OrdersSchema.aggregate([
            { $match : { userId : ObjectID(req.headers["userid"]) } },
            { $match : { status : "initial" } },
            {$lookup:{
                from : "stocks", 
                localField: "stockId", 
                foreignField: "_id", 
                as : "stockDetail"
            }},
        ])
        var totalPrice = "0";
        var totalDiscount = "0";
        for(var indx=0;indx<cartData.length;indx++){
            totalPrice= SumPrices([totalPrice,cartData[indx].totalPrice])
            totalDiscount=SumPrices([totalDiscount,cartData[indx].totalDiscount])
        }
        res.json({cart:{items:cartData,totalPrice:totalPrice,totalDiscount:totalDiscount,orderId:"MGM1401"+Date.now()}})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/addCart', auth,async (req,res)=>{
    const userId=req.body.userId?req.body.userId:req.headers["userid"]
    const data={
        userId: req.headers["userid"],
        sku:req.body.sku,
        count:req.body.count?req.body.count:1
    } 
    var status='undone'
    try{
        const ItemExists = await sepidarstock.findOne({sku:data.sku})
        if(!ItemExists){
            res.json({message: "کالا موجود نیست"})
            return}
        const cartData = await Cart.findOne({ userId : ObjectID(req.headers["userid"]),
             sku : data.sku, align:data.align} )
        if(cartData){
            const newCount=SumCount([cartData.count,data.count])
            await Cart.updateOne({_id:cartData._id},
                {$set:{count:newCount}})
            status="updateCart"
        }
        else{
            data.price=ItemExists.price,
            data.weight=ItemExists.weight
            await Cart.create(data)
            status="newCart"
        }
        const cartOut = await Cart.aggregate([
            { $match : { userId : (req.headers["userid"]) } },
            {$lookup:{
                from : "sepidarstocks", 
                localField: "sku", 
                foreignField: "sku", 
                as : "stockDetail"
            }}])
        const standardCart = await cartCreator(cartOut,userId)
        res.json({cart:standardCart,status:status})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

const cartCreator=async(cartItemsRaw,userId)=>{
    var credit = await calcCredit(userId)
    const cartItems = await calcDiscount(cartItemsRaw,userId)
    var needCredit = 0
    var newCart=[]
    var newFOB=[]
    var totalWeight=0
    var freeWeight=0
    var totalPrice = 0
    var totalDiscount = 0
    for(var c=0;c<cartItems.length;c++){
        const weight=cartItems[c].stockDetail[0].weight
        const price=cartItems[c].stockDetail[0].price
        const freePrice=cartItems[c].stockDetail[0].freePrice
        for(var counter=0;counter<cartItems[c].count;counter++)
        {
            totalWeight+=cartItems[c].weight
            var tempCredit = cartItems[c].weight + needCredit
            if(!credit||tempCredit>credit.credit){
                var discountPrice = cartItems[c].discount?cartItems[c].discount.discount:0
                newFOB.push({
                    sku:cartItems[c].sku,
                    weight:weight,
                    price:freePrice,
                    discount:discountPrice,
                    fob:1,
                    type:"fob",
                    stockDetail:cartItems[c].stockDetail
                })
                freeWeight+=parseInt(weight)
                totalPrice+=(parseInt(freePrice)-parseInt(discountPrice))
                totalDiscount+=parseInt(discountPrice)
            } 
            else{
                needCredit+=cartItems[c].weight
                var discountPrice = cartItems[c].discount?cartItems[c].discount.discount:0
                newCart.push({
                    sku:cartItems[c].sku,
                    weight:weight,
                    discount:discountPrice,
                    price:price,
                    type:"credit",
                    stockDetail:cartItems[c].stockDetail
                })
                totalPrice+=(parseInt(price)-parseInt(discountPrice))
                totalDiscount+=parseInt(discountPrice)
            }
            
        }
    }

    const regularCart = IntegrateCart(newCart)
    const freeCart = IntegrateCart(newFOB)
    
    return({cart:regularCart.concat(freeCart), 
        freeCredit:freeWeight,
        cartCredit:needCredit,
        allCredit:totalWeight,cartPrice:totalPrice,
        cartDiscount:totalDiscount,
    myCredit:credit.credit,orders:cartItems})
}

const IntegrateCart=(cartSeprate)=>{
    var cart=[]

    for(var i=0;i<cartSeprate.length;i++){
        var index = cart.findIndex(item=>item.sku===cartSeprate[i].sku)
        
        if(cart.length&&index!==-1)
            cart[index].count = (cart[index].count&&cart[index].count)+1
        else cart.push({...cartSeprate[i],count:1})
    }
    return(cart)
}
router.post('/removeCart', auth,async (req,res)=>{
    const data={
        userId: req.headers["userid"],
        sku:req.body.sku
    }
    var status='undone'
    try{
        const cartData = await Cart.findOne({ userId : ObjectID(req.headers["userid"]),
             sku : data.sku} )
        if(cartData&&data.sku){
            await Cart.deleteOne({_id:cartData._id})
            status="deleteCart"
        }
        if(!data.sku){
            await Cart.deleteMany({userId:data.userId})
            status="deleteAll"
        }
        const cartOut = await Cart.aggregate([
            { $match : { userId : (req.headers["userid"]) } },
            {$lookup:{
                from : "sepidarstocks", 
                localField: "sku", 
                foreignField: "sku", 
                as : "stockDetail"
            }}])
        const standardCart = await cartCreator(cartOut,req.headers["userid"])
        res.json({cart:standardCart,status:status})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/editCart', auth,async (req,res)=>{
    const userId=req.body.userId?req.body.userId:req.headers["userid"]
    const data={
        userId: req.headers["userid"],
        sku:req.body.sku,
        align:req.body.align,
        count:req.body.count
    } 
    try{
        const cartData = await Cart.updateOne({ userId : ObjectID(req.headers["userid"]),
             sku : data.sku, align:data.align},{$set:{count:data.count}} )
        const cartOut = await Cart.aggregate([
            { $match : { userId : (req.headers["userid"]) } },
            {$lookup:{
                from : "sepidarstocks", 
                localField: "sku", 
                foreignField: "sku", 
                as : "stockDetail"
            }}])
        const standardCart = await cartCreator(cartOut,userId)
        res.json({cart:standardCart,status:"edited"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/getCart', auth,async (req,res)=>{
    const userId=req.body.userId?req.body.userId:req.headers["userid"]
    const cartOut = await Cart.aggregate([
        { $match : { userId : (req.headers["userid"]) } },
        {$lookup:{
            from : "sepidarstocks", 
            localField: "sku", 
            foreignField: "sku", 
            as : "stockDetail"
        }}])
        const cartDetail = await cartCreator(cartOut,userId)    
    res.json({oldCart:cartOut,cart:cartDetail})
})
router.get('/getCart', auth,async (req,res)=>{
    const userId=req.body.userId?req.body.userId:req.headers["userid"]
    const cartOut = await Cart.aggregate([
        { $match : { userId : (req.headers["userid"]) } },
        {$lookup:{
            from : "sepidarstocks", 
            localField: "sku", 
            foreignField: "sku", 
            as : "stockDetail"
        }}])
        const cartDetail = await cartCreator(cartOut,userId)    
    res.json({oldCart:cartOut,cart:cartDetail})
}) 
router.get('/cartside', async (req,res)=>{
    //console.log("CartSideApi")
    const transData = await transferMethod.find().sort({"sort":1});
    const paymentData = await paymentMethod.find().sort({"sort":1});
    res.json({transferMethod:transData,paymentMethod:paymentData})
})


const SumPrices =(prices)=>{
    //console.log("SumPricesApi")
    var outResult = 0;
    for(var index=0;index<prices.length;index++){
        if(prices[index]){
            try{outResult+=parseInt(prices[index].toString().replace(/,/g,''))}
		catch{}
		}
    }
    return(outResult.toString())
}
const SumCount =(count)=>{
    //console.log("SumPricesApi")
    var outResult = 0;
    for(var index=0;index<count.length;index++){
        if(count[index]){
            try{outResult+=parseInt(count[index].toString().replace(/,/g,''))}
		catch{}
		}
    }
    return(outResult.toString())
}
module.exports = router;