const catModel = require('../model/products/category');
const Product = require('../model/products/Product');
const slideModel = require('../model/slider');
const services = require('../model/services');
const Posts = require('../model/products/Post');
const OrdersSchema = require('../model/Order/orders');
const brands = require('../model/brands/brand');
const brandsSlider = require('../model/brands/brandsSlider');
const brandsBanner = require('../model/brands/brandsBanner');
const menu = require('../model/menu');
const user = require('../model/user');
const RXSchema = require('../model/Order/rx');
const offerLogSchema = require("../model/Params/logsOffer")
const orders = require('../model/Order/orders');
const userInfo = require('../model/userInfo');
const pages = require('../model/pages');
const mgmInfo = require('../model/mgmInfo');
const Offers = require('../model/Order/Offers');
var ObjectID = require('mongodb').ObjectID;
const orderLogSchema = require('../model/Params/logsOrder')
//mainApi
exports.mainApi=async(req,res)=>{
    //console.log("MainApi")
    try{
        const catData = await catModel.find({});
        //const proDataInit = await (await Product.find());
        const proData = await(await Product.aggregate([{
            $lookup:{
                from : "categories", 
                localField: "categories", 
                foreignField: "_id", 
                as : "catName"
            }}]))
        const slideData = await (await slideModel.find());
        const ServiceData = await services.find();
        const PostData = await Posts.find();
        const BrandSliderData = await brandsSlider.aggregate([{
            $lookup:{
                from : "brands", 
                localField: "brand", 
                foreignField: "_id", 
                as : "brandData"
            }}]);
        res.json({category:catData,
            products:proData,
            slider:slideData,
            brandSlider:BrandSliderData,
            services:ServiceData,
            posts:PostData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.layoutApi=async(req,res)=>{
    //console.log("LayoutApi")
    const userId=req.headers['userid']
    try{
        const catData = await catModel.find({});
        const userData = userId?await user.findOne({_id:userId}):''
        const aboutData = await pages.findOne({url:"about"});
        const storeData = await mgmInfo.findOne({shopCode:"mgm"});
        res.json({category:catData, user:userData,about:aboutData,store:storeData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.categoryPageApi=async(req,res)=>{
    //console.log("CategoryApi")
    try{
        const catData = await catModel.find({});
        const brandData = await brands.find();
        const BrandBannerData = await brandsBanner.aggregate([{
            $lookup:{
                from : "brands", 
                localField: "brand", 
                foreignField: "_id", 
                as : "brandData"
            }}]);
        res.json({
            brands:brandData,
            brandBanner:BrandBannerData,
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}
exports.userOrderApi=async(req,res)=>{
    //console.log("UserOrderApi")
    try{
        const userData = await user.aggregate([{
            $lookup:{
                from : "rxes", 
                localField: "_id", 
                foreignField: "userId", 
                as : "orders"
            }},
            {
                $lookup:{
                    from : "userinfos", 
                    localField: "_id", 
                    foreignField: "userId", 
                    as : "userInfo"
                }}
        ]);
        res.json(userData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}
function isToday(date) {
    const today = new Date();
    if (today.toDateString() === date.toDateString()) {
      return true;
    }
    return false;
  }
function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return true;
    }
    return false;
  }
exports.reportApi = async(req,res)=>{
    //console.log("ReportApi")
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var nowDate = new Date();
    //const str = nowDate.toLocaleString('en-US', { timeZone: 'Asia/Tehran' });
    
    try{const data={
        orderNo:req.body.orderNo,
        status:req.body.status,
        customer:req.body.customer,
        offset:req.body.offset,
        brand:req.body.brand,
        dateFrom:
            req.body.dateFrom?req.body.dateFrom[0]+"/"+
            req.body.dateFrom[1]+"/"+req.body.dateFrom[2]+" "+"00:00":
            new Date().toISOString().slice(0, 10)+" 00:00",
            //new Date(nowDate.setDate(nowDate.getDate() - 1)).toISOString().slice(0, 10)+" "+"00:00",
        dateTo:
            req.body.dateTo?req.body.dateTo[0]+"/"+
            req.body.dateTo[1]+"/"+req.body.dateTo[2]+" 23:59":
            new Date().toISOString().slice(0, 10)+" 23:59",
        pageSize:pageSize
    }
    //console.log(data.dateTo,data.dateFrom) 
    //console.log(data.dateTo&&data.dateTo[0]+"/"+data.dateTo[1]+"/"+data.dateTo[2]) 
    //var initIso = new Date();
    ////console.log(initIso)
    const nowIso=nowDate.toISOString();
    ////console.log(nowIso)
    const nowParse = Date.parse(nowIso);
    const now = new Date(nowParse)
    var now2 = new Date();
    var now3 = new Date();

    const dateFromEn = new Date(now2.setDate(now.getDate()-(data.dateFrom?data.dateFrom:1)));
    
    dateFromEn.setHours(0, 0, 0, 0)
    const dateToEn = new Date(now3.setDate(now.getDate()-(data.dateTo?data.dateTo:0)));
    
    dateToEn.setHours(23, 59, 0, 0)
    ////console.log(dateToEn)
    const userData = data.customer?await user.find({cName:{$regex :data.customer}}):{};
    ////console.log(userData)
    const inprogressLog= await orderLogSchema.find({status:"inprogress"})
    .find({date:{$gte:new Date(data.dateFrom)}})
    .find({date:{$lte:new Date(data.dateTo)}})

    var todayOrder = inprogressLog.length;
    var yesterdayOrder = 0;
    /*for(var indx = 0;indx<inprogressLog.length;indx++){
        isToday(inprogressLog[indx].date)&&(todayOrder++)

        isYesterday(inprogressLog[indx].date)&&(yesterdayOrder++)
    } */
    const reportList = await OrdersSchema.aggregate([
        {$lookup:{
            from : "users", 
            localField: "userId", 
            foreignField: "_id", 
            as : "userInfo"
        }},
        { $match:req.body.userId?{userId:ObjectID(req.body.userId)}:{}},
    { $match:data.status?{status:new RegExp('.*' + data.status + '.*')}:{status:{$not:{$regex:/^initial.*/}}}},
        { $match:data.orderNo?{stockOrderNo:new RegExp('.*' + data.orderNo + '.*')}:{}},
        { $match:data.brand?{brand:data.brand}:{}},
        { $match:!data.orderNo?{date:{$gte:new Date(data.dateFrom)}}:{}},
        { $match:!data.orderNo?{date:{$lte:new Date(data.dateTo)}}:{}},
        { $sort: {"date":-1}},
 
        ])
        const filter1Report = data.customer?
        reportList.filter(item=>item.userInfo[0]&&item.userInfo[0].cName&&
            item.userInfo[0].cName.includes(data.customer)):reportList;
        const orderList = filter1Report.slice(data.offset,
            (parseInt(data.offset?data.offset:0)+parseInt(data.pageSize)))  
        
       res.json({filter:orderList,filterList:filter1Report,
        size:filter1Report.length,todayOrder:todayOrder,yesterdayOrder:yesterdayOrder})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}
exports.customersApi=async(req,res)=>{
    //console.log("CustomerApi")
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    try{
        const data={
        customer:req.body.customer,
        customerAlt:req.body.customerAlt,
        group:req.body.group,
        offset:req.body.offset?req.body.offset:"0"
    } 
    const userTotalData = await user.aggregate([
        {$lookup:{
            from : "userinfos", 
            localField: "_id", 
            foreignField: "userId", 
            as : "userDetail"
        }},
        {$match:(data.customer?{$or:[
            {phone:new RegExp('.*' + data.customer + '.*')},
            {cName:new RegExp('.*' + data.customer + '.*')},
            {cName:new RegExp('.*' + data.customerAlt + '.*')}]}:{})},
        {$match:(data.group?{group:data.group}:{})},
        {$skip:parseInt(data.offset)},{$limit:10}])
        //const userCount = (await user.find()).length;
        const userData = await user.find(data.customer?{$or:[
            {phone:new RegExp('.*' + data.customer + '.*')},
            {cName:new RegExp('.*' + data.customer + '.*')},
            {cName:new RegExp('.*' + data.customerAlt + '.*')}]}:{})
            .find(data.group&&{group:data.group})
        .skip(data.offset).limit(pageSize);
        
        
        const userAll = await user.find(data.customer?{$or:[
            {phone:new RegExp('.*' + data.customer + '.*')},
            {cName:new RegExp('.*' + data.customer + '.*')}]}:{})
            .find(data.group&&{group:data.group})
        const totalUser = await user.find();
        //const filter1Report = data.customer?userData.filter(item=>item.phone.includes(data.customer)):userData;
        //const filter2Report = data.group?filter1Report.filter(item=>item.group===data.group):filter1Report;
        const userGroup = [...new Set(totalUser.map(item=>item.group))];
        res.json({customers:userData,userData:userAll,size:userAll.length,
            userGroup:userGroup,totalUser:userTotalData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.userMainInfo = async(req,res)=>{
    //console.log("UserMainInfoApi")
    var userId = req.body.userId;
    try{
    const userMainData = await user.findOne({_id:userId}) 
    const userData = await userInfo.findOne({userId:userId}) 
    const orderData = await RXSchema.find({userId:userId})
    const offerData = await Offers.find({userId:userId})
    res.json({userInfo:userData,userMainData:userMainData,
        orderData:orderData,offerData:offerData})
    }catch{

    }

}

exports.userDetailInfo = async(req,res)=>{
    //console.log("UserDetailInfoApi")
    var phone = req.body.userId;
    try{  
        const rawUser = await user.findOne({phone:phone})
        if(rawUser){
        const userData = await userInfo.findOne({userId:rawUser._id}) 
        const orderData = await RXSchema.find({userId:rawUser._id})
        const offerData = await Offers.find({userId:rawUser._id})
        const offerLogData = await offerLogSchema.find({userId:rawUser._id})
        res.json({rawUser:rawUser,userInfo:userData,orderData:orderData,
            offerData:offerData,offerLogData:offerLogData})
        }
      
    }
    catch{
        res.json({error:"error occure"})
    }
}
