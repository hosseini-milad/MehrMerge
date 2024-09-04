const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;

const ManSchema = require('../model/Order/manufacture');
const OrdersSchema = require('../model/Order/orders');
const UserSchema = require('../model/user');
const OrderSchema = require('../model/Order/orders');
const user = require('../model/user');

router.post('/sku/find',jsonParser,async (req,res)=>{
    try{
        const manData = await ManSchema.findOne({sku:req.body.sku});
        res.json(manData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}) 
router.post('/fetch-order',jsonParser,async (req,res)=>{
    var orderNo = req.body.orderNo
    try{
    const orderData = await OrderSchema.findOne({stockOrderNo:orderNo})
    const userData = await user.findOne({_id:ObjectID(orderData.userId)})
    res.json({orderData:orderData,user:userData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    var nowDate = new Date();
    try{
        const data={
        orderNo:req.body.orderNo,
        status:req.body.status,
        customer:req.body.customer,
        brand:req.body.brand,
        group:req.body.group,
		contractor:req.body.contractor,
		contractorId:req.body.contractorId,
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

    const reportList = await OrderSchema.aggregate([
        {$lookup:{
            from : "users", 
            localField: "userId", 
            foreignField: "_id", 
            as : "userInfo"
        }}, 
        {$lookup:{
            from : "users", 
            localField: "contractor", 
            foreignField: "cCode", 
            as : "contractorInfo"
        }}, 
        { $match:req.body.userId?{userId:ObjectID(req.body.userId)}:{}},
    { $match:data.status?{status:new RegExp('.*' + data.status + '.*')}:{status:{$not:{$regex:/^initial.*/}}}},
        { $match:data.orderNo?{stockOrderNo:new RegExp('.*' + data.orderNo + '.*')}:{}},
        { $match:data.brand?{brand:data.brand}:{}},
		{ $match:data.group?{group:data.group}:{}},
        { $match:{stockOrderNo:{$ne:null}}},
        { $match:data.contractor?data.contractor=="true"?
			{contractor:{$exists:true}}:{contractor:{$exists:false}}:{}},
        { $match:data.contractorId?{contractor:data.contractorId}:{}},
        { $match:!data.orderNo?{loadDate:{$gte:new Date(data.dateFrom)}}:{}},
        { $match:!data.orderNo?{loadDate:{$lte:new Date(data.dateTo)}}:{}},
        { $sort: {"loadDate":-1}},
 
        ])
    const cancelOrder =await OrderSchema.aggregate([
        {$lookup:{
            from : "users", 
            localField: "userId", 
            foreignField: "_id", 
            as : "userInfo"
        }}, 
        { $match:req.body.userId?{userId:ObjectID(req.body.userId)}:{}},
        { $match:{status:new RegExp('.*cancel.*')}},
        { $match:data.brand?{brand:data.brand}:{}},
        { $match:!data.orderNo?{loadDate:{$gte:new Date(data.dateFrom)}}:{}},
        { $match:!data.orderNo?{loadDate:{$lte:new Date(data.dateTo)}}:{}},
        { $sort: {"loadDate":-1}},
        {$limit:10}
        ])
        const filter1Report = data.customer?
        reportList.filter(item=>item.userInfo[0]&&item.userInfo[0].cName&&
            item.userInfo[0].cName.includes(data.customer)):reportList;
        const orderList = filter1Report.slice(offset,
            (parseInt(offset)+parseInt(data.pageSize)))  
        const brandUnique = [...new Set(filter1Report.map((item) => item.brand))];
        const orderUnique = [...new Set(filter1Report.map((item) => item.stockOrderNo))];
        
        for(var i=0;i<orderList.length;i++){
            var contractorInfo =''
            if(orderList.contractor)
                contractorInfo= await UserSchema.findOne({cCode:orderList.contractor})
            orderList.contractorInfo = contractorInfo 
        }

       res.json({filter:orderList,brand:brandUnique, orderNo:orderUnique,
        cancelOrder:cancelOrder,
        size:filter1Report.length,rxStatus:rxStatus(reportList)})
    } 
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/editOrder',jsonParser,async(req,res)=>{
    try{ 
        const data = {
            userId:req.body.userId,
            status:req.body.status
        }
        const rxDetail= await OrderSchema.updateOne({stockOrderNo:req.body.orderNo},
            {$set:{...data}}) 
        
        res.json(rxDetail)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/rxStatus',jsonParser,async(req,res)=>{
    try{
        const userData = await UserSchema.findOne({_id:ObjectID(req.headers['userid'])})
        //console.log(userData)
        const filters=req.body.filters?
            req.body.filters
            //rxOrderNo:req.body.rxOrderNo?req.body.rxOrderNo:''
        :{}
        const date=req.body.date?{
            dateFrom:
                req.body.date.dateFrom?req.body.date.dateFrom[0]+"/"+
                req.body.date.dateFrom[1]+"/"+req.body.date.dateFrom[2]+" "+"00:00":
                new Date().toISOString().slice(0, 10)+" 00:00",
                //new Date(nowDate.setDate(nowDate.getDate() - 1)).toISOString().slice(0, 10)+" "+"00:00",
            dateTo:
                req.body.date.dateTo?req.body.date.dateTo[0]+"/"+
                req.body.date.dateTo[1]+"/"+req.body.date.dateTo[2]+" 23:59":
                new Date().toISOString().slice(0, 10)+" 23:59",
        }:{}
        const rxData = await RXSchema//.find(filters)
        .find();
        const rxDataAll = rxData.length
        const rxDataInitial = findStatusCount(rxData,"initial")
        const rxDataInprogress = findStatusCount(rxData,"inprogress");
        const rxDataAccepted = findStatusCount(rxData,"accept");
        
        const rxDataQC = findStatusCount(rxData,"qc");
        const rxDataInVehicle = findStatusCount(rxData,"inVehicle");
        const rxDataOutVehicle = findStatusCount(rxData,"outVehicle");
        const rxDataFaktor = findStatusCount(rxData,"faktor");
        const rxDataSending = findStatusCount(rxData,"sending");
        const rxDataDelivered = findStatusCount(rxData,"delivered");
        const rxDataCompleted = findStatusCount(rxData,"completed");
        const rxDataCancel = findStatusCount(rxData,"cancel");
        const rxDataHold = findStatusCount(rxData,"hold");
        const rxDataSuspend= findStatusCount(rxData,"suspend");
        
        res.json({status:[
            {status:"all",count:rxDataAll},
            {status:"initial",count:rxDataInitial},
            {status:"inprogress",count:rxDataInprogress},
            {status:"accept",count:rxDataAccepted},
            {status:"outVehicle",count:rxDataOutVehicle},
            {status:"inVehicle",count:rxDataInVehicle},
            {status:"faktor",count:rxDataFaktor},
            {status:"sending",count:rxDataSending},
            {status:"delivered",count:rxDataDelivered},
            {status:"suspend",count:rxDataSuspend},
            {status:"storeSent",count:rxDataStoreSent},
            {status:"hold",count:rxDataHold},
            {status:"completed",count:rxDataCompleted},
            {status:"cancel",count:rxDataCancel},
        ],
        userInfo:userData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
const rxStatus=(orderList)=>{
    var statusList = [
        {status:"all",count:0},
        {status:"initial",count:0},
        {status:"inprogress",count:0},
        {status:"accept",count:0},
        {status:"inVehicle",count:0},
        {status:"outVehicle",count:0},
        {status:"faktor",count:0},
        {status:"sending",count:0},
        {status:"delivered",count:0},
        {status:"suspend",count:0},
        {status:"storeSent",count:0},
        {status:"hold",count:0},
        {status:"completed",count:0},
        {status:"contractor",count:0},
        {status:"cancel",count:0}]
    for(var index=0;index<statusList.length;index++)
        statusList[index].count = 
        findStatusCount(orderList,statusList[index].status)

    return(statusList)
}
const findStatusCount=(orderList,status)=>{
    var count = 0;
    for(var i=0;i<orderList.length;i++)
        if(orderList[i].status === status||status==="all")
            count++
    return count
}

router.get('/payment',jsonParser,async(req,res)=>{
    try{
        //const data = await Payment("Me122455","userId")
        res.json({data:"data"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

module.exports = router;