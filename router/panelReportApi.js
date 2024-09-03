const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;
const user = require('../model/user'); 
const customer = require('../model/customers')
const orders = require('../model/Order/orders');
const PersianToEnglishDate = require('../AdminPanel/components/PersianToEnglishDate');
const notif = require('../model/Params/notif');

router.get('/report-top',jsonParser,async (req,res)=>{
    const zeroDate = new Date()
    const zeroTime = zeroDate.toISOString().split('T')[0]+
    "T00:00:00.000Z"
    try{
        var pDate= new Date()
        .toLocaleDateString('fa')
        var dateSplit = pDate.split('/')
        var month = normalNumber(dateSplit[1])
        var year = normalNumber(dateSplit[0])
        var lastMonth = month>1?(month-1):12
        var lastYear = lastMonth ===12?year-1:year
        var startMonth = PersianToEnglishDate(normalNumber(dateSplit[0]),
        normalNumber(dateSplit[1]),"1","23:59:00")
        var startDate = PersianToEnglishDate(lastYear,
        lastMonth,"1","00:00:00")
        var endDate = PersianToEnglishDate(lastYear
        ,lastMonth,normalNumber(dateSplit[2]),"23:59:59")

        var orderData = await orders.aggregate( [
            {$match:{"loadDate":{
                $gte: startMonth}}},
            {$match:{status:{$in:["outVehicle","completed"]}}}
            
        ])
        var orderDataMonth = await orders.aggregate( [
            {$match:{"loadDate": {
            $gte: startDate}}},
            {$match:{"loadDate": {
                $lte:endDate }}},
            {$match:{status:{$in:["inVehicle","outVehicle",
                "Control","completed"]}}}
        ])
        var creditDataMonth = await user.aggregate( [
            {$match:{credit1:{$exists:true}}}
        ])

        var mehrCount = 0
        var sahandCount = 0
        var totalCount = 0
        var mehrUser = []
        var sahandUser=[]
        var totalUser =[]
        var unCount = 0
        for(var i =0;i<orderData.length;i++){
            if(!orderData[i])continue
            if(!(orderData[i].group)){unCount++; continue;}
            totalCount+=sumWeight(orderData[i].freeCredit,
                orderData[i].credit)
            if(totalUser.indexOf(orderData[i].userId.toString())===-1)
                totalUser.push(orderData[i].userId.toString())
            
            if(orderData[i].group.includes('مهر')){
                mehrCount+=sumWeight(orderData[i].freeCredit,
                    orderData[i].credit)
                if(mehrUser.indexOf(orderData[i].userId.toString())===-1)
                    mehrUser.push(orderData[i].userId.toString())
                }
            else if(orderData[i].group.includes('سهند')){
                sahandCount+=sumWeight(orderData[i].freeCredit,
                    orderData[i].credit)
                if(sahandUser.indexOf(orderData[i].userId.toString())===-1)
                    sahandUser.push(orderData[i].userId.toString())
                }
            else unCount+=sumWeight(orderData[i].freeCredit,
                orderData[i].credit)
        }

        var totalCountMonth = 0
        var mehrCountMonth = 0
        var sahandCountMonth = 0
        var mehrUserMonth = []
        var sahandUserMonth=[]
        var totalUserMonth=[] 
        var unCountMonth = 0

        for(var i =0;i<orderDataMonth.length;i++){
            if(!orderDataMonth[i])continue
            if(!(orderDataMonth[i].group)){unCountMonth++; continue;}
            totalCountMonth+=sumWeight(orderDataMonth[i].freeCredit,
                orderDataMonth[i].credit)
            if(totalUserMonth.indexOf(orderDataMonth[i].userId.toString())===-1)
                totalUserMonth.push(orderDataMonth[i].userId.toString())
            
            if(orderDataMonth[i].group.includes('مهر')){
                mehrCountMonth+=sumWeight(orderDataMonth[i].freeCredit,
                    orderDataMonth[i].credit)
                if(mehrUserMonth.indexOf(orderDataMonth[i].userId.toString()) === -1)
                    mehrUserMonth.push(orderDataMonth[i].userId.toString())
            }
            else if(orderDataMonth[i].group.includes('سهند')){
                sahandCountMonth+=sumWeight(orderDataMonth[i].freeCredit,
                    orderDataMonth[i].credit)
                if(sahandUserMonth.indexOf(orderDataMonth[i].userId.toString()) === -1)
                    sahandUserMonth.push(orderDataMonth[i].userId.toString())
            }
            else unCountMonth+=sumWeight(orderDataMonth[i].freeCredit,
                orderDataMonth[i].credit)
        }
        //const coatingList = [...new Set(stockData.map(item=>item.coating))];

        var creditMehr = 0
        var creditSahand = 0

        var fobMehr = 0
        var fobSahand = 0
        for(var i=0;i<creditDataMonth.length;i++){
            if(!creditDataMonth[i])continue
            if(!(creditDataMonth[i].group)){ continue;}
            if(creditDataMonth[i].group.includes('مهر')){
                creditMehr+=sumWeight(creditDataMonth[i].credit1, creditDataMonth[i].credit2) 
                fobMehr+=sumWeight(creditDataMonth[i].fob, 0) 
            }
            if(creditDataMonth[i].group.includes('سهند')){
                creditSahand+=sumWeight(creditDataMonth[i].credit1, creditDataMonth[i].credit2) 
                fobSahand+=sumWeight(creditDataMonth[i].fob, 0) 
            }
        }


        res.json({orderCount:{mehrCount:mehrCount,sahandCount:sahandCount,unCount:unCount,total:totalCount},
        result:orderDataMonth.length,date:{start:startDate,end:endDate},
        userToday:{mehr:mehrUser.length,sahand:sahandUser.length,total:totalUser.length},
        monthUser:{mehr:mehrUserMonth.length,sahand:sahandUserMonth.length,total:totalUserMonth.length},
        orderCountMonth:{mehrCount:mehrCountMonth,sahandCount:sahandCountMonth,unCount:unCountMonth,total:totalCountMonth},
        credit:{mehr:creditMehr,sahand:creditSahand},
        fob:{mehr:fobMehr,sahand:fobSahand},
        percent:{mehr:calcPercent(creditMehr,fobMehr,mehrCount),
            sahand:calcPercent(creditSahand,fobSahand,sahandCount)},
        data:{startDate:startDate,endDate:endDate,date:dateSplit}})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

function calcPercent(w1,w2,ow){
    var w1Int = parseInt(w1)
    var w2Int = parseInt(w2)
    var owInt = parseInt(ow)
    var outPut = owInt/(w1Int+w2Int)*10000
    return(parseInt(outPut)/100)
}

function normalNumber(number){
    return(number.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  }
function sumWeight(weight1,weight2){
    if(!weight1)return(weight2?parseInt(weight2):0)
    if(!weight2)return(weight1?parseInt(weight1):0)
    //console.log(weight1," + ",weight2 , " = ",parseInt(weight1)+parseInt(weight2))
    return(parseInt(weight1)+parseInt(weight2))

}

router.get('/report-State',async (req,res)=>{
    var today=new Date()
    const date ={
        dateFrom:
            new Date(today.setDate(today.getDate() - 1)),
            //new Date(nowDate.setDate(nowDate.getDate() - 1)).toISOString().slice(0, 10)+" "+"00:00",
        dateTo:
            new Date().toISOString()
    } 
    const reportList = await orders.aggregate([
        { $match:{loadDate:{$gte:new Date(date.dateFrom)}}},
        { $match:{loadDate:{$lte:new Date(date.dateTo)}}},
        { $sort: {"loadDate":-1}},
 
        ])
        var stateResult ={
            completed:{mehr:0,sahand:0,total:0},
            outVehicle:{mehr:0,sahand:0,total:0},
            saleControl:{mehr:0,sahand:0,total:0},
            inVehicle:{mehr:0,sahand:0,total:0},
            inprogress:{mehr:0,sahand:0,total:0}
        }
    for(var i=0;i<reportList.length;i++){
        if(!reportList[i].status) continue
        if(!reportList[i].group) continue
        if(!stateResult[reportList[i].status]) continue
        if(reportList[i].group.includes("مهر")){
            stateResult[reportList[i].status].mehr ++;
            stateResult[reportList[i].status].total ++;
        }
        else if(reportList[i].group.includes("سهند")){
            stateResult[reportList[i].status].sahand ++;
            stateResult[reportList[i].status].total ++;
        }
    }
    
    res.json(stateResult)
  try{ 
  }
  catch(error){
      res.status(500).json({error:error})
  }
})

router.post('/OrderDashboard',async (req,res)=>{
    var today=new Date()
    const date ={
        dateFrom:
            new Date(today.setDate(today.getDate() - 8)),
            //new Date(nowDate.setDate(nowDate.getDate() - 1)).toISOString().slice(0, 10)+" "+"00:00",
        dateTo:
            new Date().toISOString()
    }
    const reportList = await orders.aggregate([
        { $match:{status:{$not: /cancel/i}}},
        { $match:{loadDate:{$gte:new Date(date.dateFrom)}}},
        { $match:{loadDate:{$lte:new Date(date.dateTo)}}},
        { $sort: {"loadDate":-1}},
 
        ]) 
        var newToday = new Date().getDay()
        var labels = [findDayOfWeek(newToday),findDayOfWeek(newToday-1),
            findDayOfWeek(newToday-2),findDayOfWeek(newToday-3),
            findDayOfWeek(newToday-4),findDayOfWeek(newToday-5),
            findDayOfWeek(newToday-6),findDayOfWeek(newToday-7)]
        var weekDataMehr =[0,0,0,0,0,0,0,0]
        var weekWeightMehr =[0,0,0,0,0,0,0,0]
        var weekDataSahand =[0,0,0,0,0,0,0,0]
        var weekWeightSahand =[0,0,0,0,0,0,0,0]
    for(var i=0;i<reportList.length;i++){
        //console.log(reportList[i].loadDate)
        //console.log(new Date())
      const diffTime = Math.abs(reportList[i].loadDate - new Date());
      var index = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      //console.log(reportList[i].stockOrderNo,index)
      if(!reportList[i].group) continue
        if(reportList[i].group.includes("مهر")){
            weekDataMehr[index]++
        
        weekWeightMehr[index]+= sumWeight(reportList[i].freeCredit,
            reportList[i].credit)
        }
        else if(reportList[i].group.includes("سهند")){
            weekDataSahand[index]++
            weekWeightSahand[index]+= sumWeight(reportList[i].freeCredit,
                reportList[i].credit)
        }
    }
    var product=[2,5,11,25,50]
    var cWeightMehr =[0,0,0,0,0]
    var cWeightSahand =[0,0,0,0,0]
    var fWeightMehr =[0,0,0,0,0]
    var fWeightSahand =[0,0,0,0,0]
    for(var i=0;i<reportList.length;i++){
        var group = ''
        if(!reportList[i].group) continue
        if(reportList[i].group.includes("مهر"))
            group ="mehr"
        else group = "sahand"

        const items = reportList[i].stockFaktor
        for(var j=0;j<items.length;j++){
            var index = product.findIndex(item=>item===
                items[j].weight)
            if(items[j].type==="credit"){
                group==="mehr"?
                cWeightMehr[index]+= items[j].count:
                cWeightSahand[index]+= items[j].count
            }
            else{
                group==="mehr"?
                fWeightMehr[index]+= items[j].count:
                fWeightSahand[index]+= items[j].count
            }
            
        }
    }
    
    res.json({mehrData:{data:weekDataMehr,weight:weekWeightMehr},
        sahandData:{data:weekDataSahand,weight:weekWeightSahand},
        labels:labels,
        pWeight:{credit:{mehr:cWeightMehr,
            sahand:cWeightSahand},
            fob: {mehr :fWeightMehr,
            sahand:fWeightSahand}}})
  try{  
  }
  catch(error){
      res.status(500).json({error:error})
  }
})
router.get('/report-user-old',jsonParser,async (req,res)=>{
    
    try{
        var pDate= new Date()
        .toLocaleDateString('fa')
        var dateSplit = pDate.split('/')
        var startMonth = PersianToEnglishDate(normalNumber(dateSplit[0]),
        normalNumber(dateSplit[1]),"1","23:59:00")
        
        var orderData = await orders.aggregate( [
            {$match:{"loadDate":{
                $gte: startMonth}}},
            {$match:{status:{$in:["outVehicle","completed"]}}}
            
        ])
        var customer = await user.aggregate( [
            {$match:{credit1:{$exists:true}}},
            {$sort:{credit1:-1}}
        ])

        var creditMehr = 0
        var FobMehr = 0
        var creditSahand = 0
        var FobSahand = 0
        var topTenCustomer =[]
        for(var i =0;i<customer.length;i++){
            //if(customer[i].credit)
            if(i<6)topTenCustomer.push(customer[i])
            if(parseInt(customer[i].credit1)||parseInt(customer[i].credit2)){
                if(customer[i].group&&customer[i].group.includes('مهر')){
                    creditMehr += parseInt(customer[i].credit1)
                    creditMehr += parseInt(customer[i].credit2)
                }
                if(customer[i].group&&customer[i].group.includes('سهند')){
                    creditSahand += parseInt(customer[i].credit1)
                    creditSahand += parseInt(customer[i].credit2)
                }
            }
            if(parseInt(customer[i].fob)){
                if(customer[i].group&&customer[i].group.includes('مهر'))
                    FobMehr += parseInt(customer[i].fob)
                if(customer[i].group&&customer[i].group.includes('سهند'))
                    FobSahand += parseInt(customer[i].fob)
            }
        }

        //const coatingList = [...new Set(stockData.map(item=>item.coating))];
        res.json({credit:{mehr:creditMehr,sahand:creditSahand},
            Fob:{mehr:FobMehr,sahand:FobSahand},
        customer:topTenCustomer})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
const findDayOfWeek=(dw)=>{
    dw = (dw+7)%7
    if(dw===6) return("شنبه");
    if(dw===5) return("جمعه");
    if(dw===4) return("5شنبه");
    if(dw===3) return("4شنبه");
    if(dw===2) return("3شنبه");
    if(dw===1) return("2شنبه");
    if(dw===0) return("1شنبه");
}
router.post('/report-user',jsonParser,async (req,res)=>{
    const sort = req.body.sort?req.body.sort:0
    const perPage = req.body.perPage?req.body.perPage:0
    try{
        var pDate= new Date()
        .toLocaleDateString('fa')
        var dateSplit = pDate.split('/')
        var startMonth = PersianToEnglishDate(normalNumber(dateSplit[0]),
        normalNumber(dateSplit[1]),"1","23:59:00")
        
        var orderData = await orders.aggregate( [
            {$match:{"loadDate":{
                $gte: startMonth}}},
            {$match:{status:{$in:["outVehicle","completed"]}}}
            
        ])

        var userOrder = []
        for(var i=0;i<orderData.length;i++){
            var found = userOrder&&userOrder.findIndex
            (item=>item.user==
                orderData[i].userId.toString())
            if(found===-1){
                var userData = await user.findOne({_id:orderData[i].userId})
                if(!userData)continue
                if(userData.profile!="659b9ce3d9c3154d2f94a82e") continue
                var userCredit = sumWeight(userData.credit1,userData.credit2)
                userCredit = sumWeight(userCredit,userData.fob)
                var coef = userCredit/sumWeight(orderData[i].credit,orderData[i].freeCredit)
                var badget = userData.badget?userData.badget:1000
                var badgetCoef = sumWeight(orderData[i].credit,orderData[i].freeCredit)/badget
                userOrder.push({
                    user:orderData[i].userId.toString(),
                    userName: userData.cName,
                    group: userData.group,
                    userCredit:userCredit,
                    badget:badget,
                    badgetCoef:badgetCoef,
                    badgetPercent:badgetCoef>1?100:Math.round(badgetCoef*10)*10,
                    orderCredit:sumWeight(orderData[i].credit,orderData[i].freeCredit),
                    coef:coef,
                    percent: coef>1?100:Math.round(coef*10)*10,
                    orders:[orderData[i].stockOrderNo]
                })
            } 
            else{

                userOrder[found].orderCredit += sumWeight(orderData[i].credit,orderData[i].freeCredit)
                userOrder[found].coef = userOrder[found].orderCredit/userOrder[found].userCredit
                userOrder[found].badgetCoef= userOrder[found].orderCredit/userOrder[found].badget
                var percent = Math.round(userOrder[found].coef.toFixed(2)*10)*10
                var perBadge = Math.round(userOrder[found].badgetCoef.toFixed(2)*10)*10
                userOrder[found].percent = percent>100?100:percent
                userOrder[found].badgetPercent = perBadge>100?100:perBadge
                userOrder[found].orders.push(orderData[i].stockOrderNo)
            }
        }
        
        console.log(sort)
        if(sort)
            userOrder.sort((a,b) => b.badgetCoef - a.badgetCoef);
        else
            userOrder.sort((a,b) => a.badgetCoef - b.badgetCoef);
        //const coatingList = [...new Set(stockData.map(item=>item.coating))];
        res.json(userOrder.slice(0, perPage))
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.get('/report-client',jsonParser,auth,async (req,res)=>{
    const userId = req.headers["userid"]
    try{
        var pDate= new Date()
        .toLocaleDateString('fa')
        var dateSplit = pDate.split('/')
        var startMonth = PersianToEnglishDate(normalNumber(dateSplit[0]),
        normalNumber(dateSplit[1]),"1","23:59:00")
        
        var orderData = await orders.aggregate( [
            {$match:{"loadDate":{
                $gte: startMonth}}},
            {$match:{status:{$in:["completed","inVehicle","outVehicle","inprogress","saleControl"]}}},   
            {$match:{userId:ObjectID(userId)}}
            
        ])
        var userData = await user.findOne({_id:ObjectID(userId)})
        var creditTotal = 0
        var fobTotal = 0
        for(var i =0;i<orderData.length;i++){
            if(!orderData[i])continue
            
            creditTotal+=sumWeight(orderData[i].credit)
            fobTotal+=sumWeight(orderData[i].freeCredit)
            
        }


        const tab1={
            title:"یارانه ای",
            text:"جمع اعتبار یارانه ای",
            value:userData.credit1,
            sub:"جمع تحویل شده",
            subValue:creditTotal
        }
        const tab2={
            title:"غیر یارانه ای",
            text:"جمع اعتبار غیر یارانه ای",
            value:userData.fob,
            sub:"جمع تحویل شده",
            subValue:fobTotal
        }
        const tab3={
            title:"اعتبار اعطایی",
            text:" اعتبار اعطایی",
            value:userData.credit,
            sub:"مانده از قبل",
            subValue:0
        }
        const lastNotif = await notif.find()
        console.log(lastNotif)
        const showNotif = (userData.showNotif==lastNotif[0]._id)?"":lastNotif[0]
        //const coatingList = [...new Set(stockData.map(item=>item.coating))];
        res.json({orderData:orderData,userData:userData,
        tabData:[tab1,tab2,tab3],showNotif:showNotif})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
module.exports = router;