const sendSmsUser = require("../AdminPanel/components/sendSms");

const sepidarstock = require("../model/Order/sepidarstock");

const logSchema = require("../model/Params/logs");
var ObjectID = require('mongodb').ObjectID;

const CheckSendSMS=async(status,userId,orderData)=>{
    console.log("start checking")
    try{ 
        const orderNo = orderData.stockOrderNo
        const ldDate = orderData.loadDate
        const stockData = orderData.stockFaktor	
        console.log(status)
        console.log(userId,process.env.acceptOrder,
            orderNo,ldDate.split(' ')[0],await calcWeight(stockData))

        if(status==="inVehicle"){
            const smsResult = await sendSmsUser(userId,process.env.acceptOrder,
                orderNo,ldDate.split(' ')[0],await calcWeight(stockData))
            //console.log("result:","smsResult")
        }
        if(status==="outVehicle"){
            const smsResult = await sendSmsUser(userId,process.env.sendOrder,
                orderNo,"token2")
            //console.log(smsResult)
        } 
        if(status.includes("cancel")){
            const newUserLog = await logSchema.create({
                title: "لغو سفارش",
                user: userId,
                kind:"customer",
                description: "سفارش با شماره "+orderNo+
                 " لغو شده است ",
                status: "unread",
                date:Date.now()
              })
            const smsResult = await sendSmsUser(userId,process.env.cancelOrder,
                orderNo,"token2")
            //console.log(smsResult)
        }
    }catch{}
}
const calcWeight=async(order)=>{
    var totalWeight =  0;
    for(var i = 0;i<order.length;i++)
    {
        const skuFind = await sepidarstock.findOne({sku:order[i].sku})
        totalWeight+=(parseInt(skuFind.design.replace(/\D/g,''))*order[i].count);
        
    }
    //console.log(order)
    return (totalWeight)
}
module.exports = CheckSendSMS;