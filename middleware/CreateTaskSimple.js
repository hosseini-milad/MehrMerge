const crmlist = require("../model/crm/crmlist")
const tasks = require("../model/crm/tasks")


const CreateTaskSimple=async(type,phone)=>{
    const crmId = await crmlist.findOne()
    if(!crmId) return('')
    const step = crmId.crmSteps.find(item=>item.index==1)
    await tasks.create({
        crmId: crmId._id,
        taskId:"ثبت مشتری "+phone,
        content:"مشتری جدید در سایت ثبت نام کرده است",
        taskStep:step.enTitle,
        prior:1,
        type:type,
    })
    return({message:"Task Created"})
}

module.exports =CreateTaskSimple