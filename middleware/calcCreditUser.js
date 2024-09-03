const orders = require("../model/Order/orders");
const user = require("../model/user");
var ObjectID = require('mongodb').ObjectID;

const calcCreditUser=async(userData)=>{
    if(!userData)return(0)
    var credit = 0;
    var fob = 0;
    var oldCredit = 0
    var oldFob = 0
    fob = creditSum(userData.fob,userData.credit)
    credit =creditSum(userData.credit1,userData.credit2)
    var today = new Date().toLocaleDateString('fa')
    var month = today.split('/')[1]
    const newOrders = await orders.find({userId:userData._id})
    for(var i=0;i<newOrders.length;i++){
        var tempDate = new Date(newOrders[i].loadDate).toLocaleDateString('fa')
        var tempMonth = tempDate.split('/')[1]
        if(month === tempMonth)
        if(newOrders[i]&&newOrders[i].status&&newOrders[i].status.includes("cancel"))
            continue
        else{
            oldFob += parseInt(newOrders[i].freeCredit?newOrders[i].freeCredit:0)
            oldCredit += parseInt(newOrders[i].credit?newOrders[i].credit:0)
        }
    } 
    //console.log(oldCredit)
    return({credit:(credit+fob)-(oldCredit+oldFob),
    remainCredit:credit-oldCredit,remainFob:fob-oldFob})
}
const creditSum=(credit1Raw,credit2Raw)=>{
    var sign = 1
    if(credit2Raw&&credit2Raw.includes('-'))
        sign = -1
    var credit1 = credit1Raw?parseInt(credit1Raw.toString().replace(/\D/g,'')):0
    var credit2 = credit2Raw?parseInt(credit2Raw.toString().replace(/\D/g,'')):0
    credit2 = credit2*sign
    return(
        credit1+credit2
    )
  }
module.exports = calcCreditUser;