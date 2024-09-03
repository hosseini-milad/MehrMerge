const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;
const multer = require('multer');
const fs = require('fs');

const user = require('../model/user');
const mime = require('mime');
const xlsx = require('node-xlsx');
const calcCredit = require('../middleware/CalcCredit');

const ProfileAccess = require('../model/user/ProfileAccess');
const classes = require('../model/user/classes');
const Policy = require('../model/user/Policy');
const brand = require('../model/brands/brand');
const Filters = require('../model/products/Filters');
const category = require('../model/products/category');
const factory = require('../model/products/factory');
const sendSmsUser = require('../AdminPanel/components/sendSms');
const sendMessageUser = require('../AdminPanel/components/sendMessage');
const payLog = require('../model/Order/payLog');
const tasks = require('../model/crm/tasks');


router.post('/fetch-user',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var userId = req.body.userId
    try{
        const userData = await user.findOne({_id: ObjectID(userId)})
        const accessList = await ProfileAccess.find()
        const userProfile = userData&&userData.profile&&
            await ProfileAccess.findOne({_id:ObjectID(userData.profile)})
       res.json({data:userData,profiles:accessList,userProfile:userProfile})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)*parseInt(pageSize)):0;
    try{const data={
        orderNo:req.body.orderNo,
        status:req.body.status,
        customer:req.body.customer,
        access:(req.body.access&&req.body.access.length)?req.body.access:'',
        offset:req.body.offset,
        profile:req.body.profile,
        class:req.body.class,
        brand:req.body.brand,
        credit:req.body.credit
    }
        const reportList = await user.aggregate([
            {$addFields: { "fullInfo": { $concat: 
                ["$cName",'(',"$phone",")" ]}}},
            { $match:data.access?{access:data.access}:{}},
            {$lookup:{
                from : "userinfos", 
                localField: "_id", 
                foreignField: "userId", 
                as : "userDetail"
            }}, 
            { $match:data.customer?{$or:[
                {meli:new RegExp('.*' + data.customer + '.*')},
                {cName:new RegExp('.*' + data.customer + '.*')},
                {cCode:new RegExp('.*' + data.customer + '.*')},
                {mobile:new RegExp('.*' + data.customer + '.*')}
            ]}:{}},
            { $match:data.credit?{credit:{$exists:true}}:{}},
            { $match:data.class?{class:{$elemMatch:{_id:data.class}}}:{}},
            { $match:data.profile?{profile:data.profile}:{}},
        ]) 
        const filter1Report = /*data.customer?
        reportList.filter(item=>item&&item.cName&&
            item.cName.includes(data.customer)):*/reportList;
        const userList = filter1Report.slice(offset,
            (parseInt(offset)+parseInt(pageSize)))  
        const accessUnique = [...new Set(filter1Report.map((item) => item.access))];
        const profiles = await ProfileAccess.find();
        const classList = await classes.find();
        for(var i=0;i<userList.length;i++){
            const credit = await calcCredit(userList[i]._id)
            userList[i].remainCredit = credit.credit
            userList[i].remainFob = credit.fob
        }
       res.json({filter:userList,size:filter1Report.length,
            access:accessUnique,profiles:profiles,classes:classList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-user',jsonParser,async (req,res)=>{
    var userId = req.body.userId
    const data={
        cName:req.body.cName,
        email:req.body.email,
        mobile:req.body.mobile,
        meli:req.body.meli,
        credit:req.body.credit,
        cCode:req.body.cCode,
        address:req.body.address,
        city:req.body.city,
        state:req.body.state,
        country:req.body.country,
        about:req.body.about,
        profile:req.body.profile,
        group:req.body.group
    }
    try{
        const userData = await user.updateOne({_id: ObjectID(userId)},
        {$set:data})
       res.json({data:userData,success:"تغییرات اعمال شدند"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
var storage = multer.diskStorage(
    {
        destination: '/dataset/',
        filename: function ( req, file, cb ) {
            cb( null, "Deep"+ '-' + Date.now()+ '-'+file.originalname);
        }
    }
  );
  const uploadImg = multer({ storage: storage ,
    limits: { fileSize: "5mb" }})

router.post('/upload',uploadImg.single('upload'), async(req, res, next)=>{
    const folderName = req.body.folderName?req.body.folderName:"temp"
    try{
        const data = (req.body.base64image)
    // to declare some path to store your converted image
    var matches = await data.match(/^data:([A-Za-z-+./]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
    return new Error('Invalid input string');
    } 
    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    
    let fileName = `MGM-${Date.now().toString()+"-"+req.body.imgName+"."+extension}`;
   var upUrl = `/uploads/${folderName}/${fileName}`
    fs.writeFileSync("."+upUrl, imageBuffer, 'utf8');
    return res.send({"status":"success",url:upUrl});
    } catch (e) {
        res.send({"status":"failed",error:e});
    }
})
router.post('/parse-list-old',jsonParser,async (req,res)=>{
    try{
        const url = req.body.url
        //const data = fs.readFileSync(url)
        //console.log(data)
        const workSheetsFromFile = xlsx.parse(
            __dirname +"/../"+url);
        const data = workSheetsFromFile[0].data
        const meliCodeIndex = data[0].indexOf("کدملی")
        const creditIndex = data[0].indexOf("مقدار تراکنش")
        //const reportList = await user.find()
        var meli=[]
        var matchError=[]
        for(var index=1;index<data.length;index++)
        {
            var pureMeli = data[index][meliCodeIndex]
            try{
                pureMeli = pureMeli.replace(/\D/g,'');
            }
            catch{}
            const result = await user.updateOne({meli:pureMeli},
                {$set:{credit:data[index][creditIndex]}})
            if(!result.matchedCount){
                matchError.push(pureMeli)
            }
            meli.push({meli:pureMeli,
                credit:{credit:data[index][creditIndex]},
                result:result})
            
        }
       res.json({filter:workSheetsFromFile,matchError:matchError,meli:meli})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/parse-list',jsonParser,async (req,res)=>{
    try{
        const url = req.body.url
        //const data = fs.readFileSync(url)
        //console.log(data)
        const workSheetsFromFile = xlsx.parse(
            __dirname +"/../"+url);
        const data = workSheetsFromFile[0].data
        const meliCodeIndex = data[0].indexOf("کدملی")!==-1?
            data[0].indexOf("کدملی"):data[0].indexOf("کد ملی")
        const creditIndex = data[0].indexOf("مقدار لیتراژ")
        const creditKind = data[0].indexOf("نوع تراکنش")

        //const reportList = await user.find()
        var meli=[]
        var matchError=[]
        var newUpdate = []
        for(var index=1;index<data.length;index++)
        {
            var pureMeli = data[index][meliCodeIndex]
            try{
                pureMeli = pureMeli.replace(/\D/g,'');
            }
            catch{}
            
        const kind = 
        data[index][creditKind]==='ماشین آلات گاز مایع سوز'?"credit1":
        data[index][creditKind]==='غیریارانه ای'?"fob":"credit2"
            //console.log(meliCodeIndex)
            //console.log(data[index][meliCodeIndex])
            //console.log(data[index][creditIndex])
            //console.log(data[index][creditKind])
            //console.log("------------------------")
            var foundIndex = newUpdate.findIndex((item=>item.meliCode===data[index][meliCodeIndex]))
            //console.log(foundIndex)
            if(foundIndex!==-1){
                newUpdate[foundIndex].credit = 
                newUpdate[foundIndex].credit + data[index][creditIndex]
            }
            else
            newUpdate.push({
                meliCode:pureMeli,
                credit:data[index][creditIndex],
                kind:kind
            })
        }
        //console.log(newUpdate)
        for(var i=0;i<newUpdate.length;i++){
            var creditPart = {}
            if(newUpdate[i].kind ==="credit1") creditPart.credit1 = newUpdate[i].credit
            if(newUpdate[i].kind ==="credit2") creditPart.credit2 = newUpdate[i].credit
            if(newUpdate[i].kind ==="fob") creditPart.fob = newUpdate[i].credit
            //console.log(newUpdate[i])
            const result = await user.updateOne({meli:newUpdate[i].meliCode},
                {$set:creditPart})
            if(!result.matchedCount){
                matchError.push(newUpdate[i].meliCode)
            }
            meli.push({meli:newUpdate[i].meliCode,
                credit:creditPart,
                result:result})
            
        }
       res.json({filter:workSheetsFromFile,
        matchError:matchError,
        meli:meli})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

/*Profile*/
router.post('/fetch-profile',jsonParser,async (req,res)=>{
    var profileId = req.body.profileId
    try{
        const profileData = await ProfileAccess.findOne({_id: ObjectID(profileId)})
       res.json({data:profileData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
}) 
router.post('/list-profiles',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)*parseInt(pageSize)):0;
    try{
        const data={
            rderNo:req.body.orderNo,
        }
        const profilesList = await ProfileAccess.find()
        res.json({profiles:profilesList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-profile',jsonParser,async (req,res)=>{
    var profileId = req.body.profileId
    if(profileId==="new")profileId= ''
    const data={
        profileName: req.body.profileName,
        profileCode: req.body.profileCode,
        manId: req.body.manId,
        parentId: req.body.parentId,
        access: req.body.access,
    }
    try{
        //const profile = await ProfileAccess.find({_id: ObjectID(profileId)})
        var profileData = ''
        if(profileId)
           profileData = await ProfileAccess.updateOne({_id: ObjectID(profileId)},{$set:data})
        else
            profileData = await ProfileAccess.create(data)
        
       res.json({data:profileData,success:"تغییرات اعمال شدند"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.get('/allow-menu',auth,jsonParser,async (req,res)=>{
    var userId = req.headers["userid"]
    if(!userId){
        res.status(500).json({error: "no Credit"})
    }
    try{
        const userData = await user.findOne({_id: ObjectID(userId)})
        const profileData = await ProfileAccess.findOne({_id: ObjectID(userData.profile)})
        
       res.json({access:profileData.access,message:"Profile List"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/fetch-class',jsonParser,async (req,res)=>{
    var classId = req.body.classId
    if(classId==="new")classId=''
    try{ 
        const classData = classId&&await classes.findOne({_id: ObjectID(classId)})
        const userClass = classData&&await user.find(
            {class: {$elemMatch: {_id:String(classData._id)}}})
        const policyClass = classData&&await Policy.find(
                {classId:String(classData._id)})
       res.json({filter:classData,userClass:userClass,policyClass:policyClass})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
}) 
router.post('/list-classes',jsonParser,async (req,res)=>{
    try{
        //const classList = await classes.find()
        const allClasses =await classSeprate(req.body.userId)
        res.json(allClasses)
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-class',jsonParser,async (req,res)=>{
    var classId = req.body.classId
    if(classId==="new")classId=''
    const data={
        className: req.body.className,
        classEn: req.body.classEn,
        classCat: req.body.classCat,
        manId: req.body.manId,
    }
    try{
        //const profile = await ProfileAccess.find({_id: ObjectID(profileId)})
        var profileData = ''
        if(classId)
           classData = await classes.updateOne({_id: ObjectID(classId)},{$set:data})
        else
        classData = await classes.create(data)
        
        const allClasses =await classSeprate(req.body.userId)
       res.json(allClasses)
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-user-class',jsonParser,async (req,res)=>{
    var userId = req.body.userId 
    const data={
        class:req.body.class
    } 
    try{
        const userData = await user.findOne({_id: ObjectID(userId)})
        var userClass = userData.class?userData.class:[]
        var found = 0
        for(var i=0;i<userClass.length;i++){
            if(userClass[i]._id == data.class._id){
                userClass.splice(i, 1)
                found =1
            } 
        }
        !found&&userClass.push(data.class)

        const newClassUser = await user.updateOne({_id: ObjectID(userId)},
        {$set:{class:userClass}})
        //const allClasses =await classSeprate(req.body.userId)
       res.json({data:newClassUser,status:"23"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
const classSeprate=async(userId)=>{
    const allClass = await classes.find()
    
    const userData = await user.findOne({_id: ObjectID(userId)})
    const assignClass = userData&&userData.class
    
    var availableClass = []
    if(assignClass)
        for(var i=0;i<allClass.length;i++){
            var found = 0
            for(var j=0;j<assignClass.length;j++){
                if(allClass[i]._id==assignClass[j]._id){
                    found = 1; break;
                }
            }
            !found&&availableClass.push(allClass[i])
        } 
    else availableClass=allClass
    return({availableClass:availableClass,
        assignClass:assignClass,filter:allClass})

}

router.post('/fetch-policy',jsonParser,async (req,res)=>{
    var policyId = req.body.policyId
    try{
        const policyData = policyId!=="new"&&await Policy.aggregate([
            {$match:{_id: ObjectID(policyId)}},
            {$addFields: { "user_Id": { $toObjectId: "$userId" }}},
            {$lookup:{from : "users", 
            localField: "user_Id", foreignField: "_id", as : "userInfo"}},
        ]) 
        const classData = await classes.find()
        const catData = await category.find()
        const brandData = await brand.find()
        const filterData = await Filters.find()
       res.json({filter:policyData&&policyData[0],classes:classData,
        brands:brandData,filters:filterData,category:catData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
}) 

router.post('/option-policy',jsonParser,async (req,res)=>{
    const category = req.body.category
    const factoryInfo = req.body.factory
    const catId = String(category._id)
    try{
        const brandData = category.brands//await brand.find()
        //console.log(brandData)
        const factoryData = await factory.find()
        const filterData = await Filters.find()
        const resultBrand = []
        const resultFilter = []
        for(var i =0;i<filterData.length;i++){
            if(filterData[i].category._id===catId)
               resultFilter.push(filterData[i])
        }
        if(factoryInfo&&brandData)
        for(var i =0;i<brandData.length;i++){
            const brandFact = brandData[i].factory
            if(brandFact)
            for(var j=0;j<brandFact.length;j++){
            if(brandFact[j]._id===factoryInfo._id)
                resultBrand.push(brandData[i])
            }
        }
       res.json({factory:factoryData,filters:resultFilter,
        brands:factoryInfo?resultBrand:brandData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
}) 
router.post('/list-policy',jsonParser,async (req,res)=>{
    try{
        const policyList = await Policy.aggregate([
            {$addFields: { "user_Id": { $toObjectId: "$userId" }}},
            {$lookup:{from : "users", 
            localField: "user_Id", foreignField: "_id", as : "userInfo"}},
        ])
        //const allClasses =await classSeprate(req.body.userId)
        res.json({filter:policyList,message:"List"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-policy',jsonParser,async (req,res)=>{
    var policyId = req.body.policyId
    if(policyId==="new")policyId= ''
    const data=req.body
    try{
        //const profile = await ProfileAccess.find({_id: ObjectID(profileId)})
        var policyData = ''
        if(policyId)
        policyData = await Policy.updateOne({_id: ObjectID(policyId)},{$set:data})
        else
        policyData = await Policy.create(data)
        
        //const allPolicy =await classSeprate(req.body.userId)
       res.json({data:policyData,status:"Done"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-user-class',jsonParser,async (req,res)=>{
    var userId = req.body.userId
    const data={
        class:req.body.class
    }
    try{
        const userData = await user.findOne({_id: ObjectID(userId)})
        var userClass = userData.class?userData.class:[]
        var found = 0
        for(var i=0;i<userClass.length;i++){
            if(userClass[i]._id == data.class._id){
                userClass.splice(i, 1)
                found =1
            } 
        }
        !found&&userClass.push(data.class)
        const newClassUser = await user.updateOne({_id: ObjectID(userId)},
        {$set:{class:userClass}})
        //const allClasses =await classSeprate(req.body.userId)
       res.json({data:newClassUser,status:"23"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/sendSMS',jsonParser,async (req,res)=>{
    var userId = req.body.userId
    const data={
        users:req.body.users,
        message:req.body.message
    }
    try{
        var messageStatus=[]
        for(var i=0;i<data.users.length;i++){
            const result = await sendMessageUser(data.users[i],data.message)
            messageStatus.push({status:result,userId:data.users[i]})
        }
       res.json({data:messageStatus,sentStatus:messageStatus.length+" sent"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/transactions',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)*parseInt(pageSize)):0;
    try{const data={
        orderNo:req.body.orderNo,
        status:req.body.status,
        customer:req.body.customer
    }
        const reportList = await payLog.aggregate([
            { $match:data.orderNo?{stockOrderNo:data.orderNo}:{}},
            {$lookup:{
                from : "users", 
                localField: "userId", 
                foreignField: "_id", 
                as : "userDetail"
            }}, 
            { $match:data.status?{payStatus:data.status}:{}},
        ]) 
        const filter1Report = /*data.customer?
        reportList.filter(item=>item&&item.cName&&
            item.cName.includes(data.customer)):*/reportList;
        const logList = filter1Report.slice(offset,
            (parseInt(offset)+parseInt(pageSize))) 
       res.json({filter:logList,size:filter1Report.length})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/taskData', async (req,res)=>{
    const taskId=req.body.taskId
    try{
        const taskDetail =taskId&&await tasks.findOne({_id:taskId})
        const currentUser = taskDetail&&taskDetail.assign&&
            await user.findOne({_id:taskDetail.assign})
        const currentProfile = taskDetail&&taskDetail.profile&&
            await ProfileAccess.findOne({_id:taskDetail.profile})
        const profileList= await ProfileAccess.find()
        const userDetails= await user.find({profile:{$exists:true}})
        res.json({user:userDetails,currentAssign:currentUser?currentUser:currentProfile,
            profileList:profileList,message:"list users"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
module.exports = router;