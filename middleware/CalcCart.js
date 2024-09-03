const Cart = require("../model/Order/Cart");
const orders = require("../model/Order/orders");
const user = require("../model/user");
const Policy = require("../model/user/Policy");
var ObjectID = require('mongodb').ObjectID;

const calcCart=async(userData)=>{
    if(!userData)return(0)
    var credit = 0;
    var fob = 0;
    var oldCredit = 0
    var oldFob = 0
    var price = 0
    var discount = 0
    fob = creditSum(userData.fob,userData.credit)
    credit =creditSum(userData.credit1,userData.credit2)
    fob = creditSum(fob,userData.remainFob)
    credit =creditSum(credit,userData.remainCredit)

    var today = new Date().toLocaleDateString('fa')
    var month = today.split('/')[1]
    var newOrders = await Cart.find({userId:userData._id}).lean()
    var cOrders = await orders.find({userId:userData._id})
        .sort({loadDate:-1}).limit(10).lean()
    var creditNeed = 0
    for(var i=0;i<(newOrders&&newOrders.length);i++){
        
        var item = newOrders[i]
        var discountTemp = await findDiscount(userData,newOrders[i])
        var pureDiscount = discountTemp?parseInt(discountTemp):0
        newOrders[i].totalPrice = (parseFloat(item.price)-parseFloat(pureDiscount))*item.count
        newOrders[i].discount = (discountTemp*item.count)
        price += newOrders[i].totalPrice
        discount += pureDiscount*item.count

        creditNeed += item.weight*item.count
        
    } 
    for(var i=0;i<(cOrders&&cOrders.length);i++){
        //
        cOrders[i].statusDetail=findStatus(cOrders[i].status)
        var tempDate = new Date(cOrders[i].loadDate).toLocaleDateString('fa')
        var tempMonth = tempDate.split('/')[1]
        if(month === tempMonth)
        if(cOrders[i]&&cOrders[i].status&&cOrders[i].status.includes("cancel"))
            continue
        else{
            oldFob += parseInt(cOrders[i].freeCredit?cOrders[i].freeCredit:0)
            oldCredit += parseInt(cOrders[i].credit?cOrders[i].credit:0)
        }
    } 
    //console.log(cOrders)
    return({credit:(credit+fob)-(oldCredit+oldFob),
        carts:newOrders,discountTemp:discountTemp,
    remainCredit:credit-oldCredit,remainFob:fob-oldFob,
    creditNeed:creditNeed,price:price, discount:discount,
    orderData:cOrders})
}
const creditSum=(credit1Raw,credit2Raw)=>{
    var sign1 = 1
    var sign2 = 1
    if(credit1Raw&&credit1Raw.toString().includes('-'))
        sign1 = -1
    if(credit2Raw&&credit2Raw.toString().includes('-'))
        sign2 = -1
    var credit1 = credit1Raw?parseInt(credit1Raw.toString().replace(/\D/g,'')):0
    var credit2 = credit2Raw?parseInt(credit2Raw.toString().replace(/\D/g,'')):0
    credit1 = credit1*sign1
    credit2 = credit2*sign2
    return(
        credit1+credit2
    )
  }
const findDiscount=async(userData,orderData)=>{
    const classData = userData.class?userData.class:''
    if(!classData) return('')
    const classId = classData.map(item=>item._id)
    const policyData = classData&&
        await Policy.find({"class._id":{$in:classId}})
    //console.log(orderData)
    const policyOff = policyData.map(item=>item.filters)
    var myOff=0
    for(var i=0;i<policyOff.length;i++){
        if(policyOff[i].volume==orderData.weight){
            myOffTemp=parseInt(policyData[i].discount)
            if(myOff<myOffTemp)
                myOff = myOffTemp
        }
        //else myOff.push({})
    }
    //var discount ={title:policyData[0].policyName,value:policyData[0].discount}
    return(myOff)
}

const findStatus=(status)=>{
    if(!status)return({title:"نامشخص",color:"white",canCan:true})
    if(status=="inprogress")return({title:"در حال ثبت",color:"orange",canCan:true})
    if(status=="inVehicle")return({title:"درب ورود",color:"purple",canCan:true})
    if(status=="saleControl")return({title:"واحد کنترل",color:"blue"})
    if(status=="outVehicle")return({title:"درب خروج",color:"purple"})
    if(status.includes("ancel"))return({title:"لغو شده",color:"red"})
    if(status=="completed")return({title:"خاتمه یافته",color:"green"})
}
module.exports = calcCart;