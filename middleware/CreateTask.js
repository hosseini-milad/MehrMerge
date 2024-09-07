const crmlist = require("../model/crm/crmlist")
const tasks = require("../model/crm/tasks")


const CreateTask=async(type,data)=>{
    const crmId = await crmlist.findOne({crmCode:"orders"})
    if(!crmId) return('')
    const step = crmId.crmSteps.find(item=>item.index==1)
    await tasks.create({
        crmId: crmId._id,
        taskId:"ثبت سفارش "+data.stockOrderNo,
        content:data.description,
        creator: data.manageId,
        customer: data.userId,
        taskStep:step.enTitle,
        orderNo:data.stockOrderNo,
        prior:1,
        type:type,
        date:new Date.now()
    })
    return({message:"Task Created"})
}

module.exports =CreateTask