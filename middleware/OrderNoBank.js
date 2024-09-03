const orders = require("../model/Order/orders");
const user = require("../model/user");
var ObjectID = require('mongodb').ObjectID;

const OrderNoBank=async(orderNo,status)=>{
    var newOrderNo = ''
    console.log(orderNo,status)
    if(status===1)
        newOrderNo=await siteToBank(orderNo)
    else
        newOrderNo=await bankToSite(orderNo)
    console.log(newOrderNo)
    return(newOrderNo)
}
const bankToSite=async(orderNo)=>{
    var orderId = orderNo.toString()
    if(orderId[0]==="3")
    if(orderId[1]==="1"){
        orderId=orderId.substring(2)
        orderId = "Mf"+orderId
    }
if(orderId[0]==="3")
    if(orderId[1]==="2"){
        orderId=orderId.substring(2)
        orderId = "Mc"+orderId
    }
    return(orderId)
}
const siteToBank=async(orderNo)=>{
    var orderId = orderNo
    if(orderId[0]==="R"){
        orderId=orderId.substring(1)
        orderId = "1"+orderId
    }
    if(orderId[0]==="S"){
        orderId=orderId.substring(1)
        orderId = "2"+orderId
    }
    if(orderId[0]==="M")
        if(orderId[1]==="f"){
            orderId=orderId.substring(2)
            orderId = "31"+orderId
        }
    if(orderId[0]==="M")
        if(orderId[1]==="c"){
            orderId=orderId.substring(2)
            orderId = "32"+orderId
        }
    return(orderId)
}
module.exports = OrderNoBank;