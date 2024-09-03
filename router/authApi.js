
const { ErrorMessageBox } = require('admin-bro');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
var ObjectID = require('mongodb').ObjectID;
var Kavenegar = require('kavenegar');
const job = require('../model/job');
const user = require('../model/user');
var api = Kavenegar.KavenegarApi({
    apikey: process.env.SMS_API
});
const User = require("../model/user");
const userAddress = require('../model/userAddress');
const userInfo = require('../model/userInfo');
const logSchema = require('../model/Params/logs')
const userCreditSchema = require('../model/userCredit');
const sendSmsUser = require('../AdminPanel/components/sendSms');
const HesabFaApiCall = require('../AdminPanel/components/hesabFaApiCall')
const CreateTask = require('../middleware/CreateTask');
const CreateTaskSimple = require('../middleware/CreateTaskSimple');
const ProfileAccess = require('../model/user/ProfileAccess');

//ثبت نام و ورود با نام کاربری پسورد
exports.registerApi = async (req, res) => {
  //console.log(("RegisterApi")
  // Our register logic starts here
  try {
    const { phone, password } = req.body;

    if (!(phone && password )) {
      res.status(400).send("All input is required");
    }
    const oldUser = await User.findOne({ phone });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      phone,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    //console.log((err);
  }
}
exports.loginApi=async(req,res)=>{
  //console.log(("LoginApi")
    try {
      // Get user input
      const { phone, password } = req.body;
      ////console.log((phone,password)
      // Validate user input
      if (!(phone && password)) {
        res.status(400).send({error:"اطلاعات وارد نشده است"});
        return;
      }
      // Validate if user exist in our database
      const user = await User.findOne({phone: phone });
      
      if(!user){
        res.status(500).send({error:"کاربر موجود نیست"});
        return;
      }
      if(user.active === "غیرفعال"){
        res.status(400).json({error:"کاربر غیرفعال است"})
        return
      }
      if(user.access ==="customer"||user.access==="request"||user.access===""){
        
        res.status(500).send({error:"لطفا با پیامک وارد شوید"});
        return;
      }
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, phone },
          process.env.TOKEN_KEY,
          {
            expiresIn: "72h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
        return;
      }
      if (user && password===user.password){
        const token = jwt.sign(
          { user_id: user._id, phone },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
        return;
      }

      else{
        res.status(400).send({error:"رمز عبور اشتباه است"}); 
      }
        //res.status(400).send("Invalid Credentials");
      } catch (err) {
        res.status(400).send({error:"خطایی رخ داده است"}); 
      }
}
exports.loginManager=async(req,res)=>{
  //console.log(("LoginManager")
  try {
      // Get user input
      const { phone , manager } = req.body;
    ////console.log((phone,password)
      // Validate user input
      if (!(phone && manager)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({phone: phone });
      if(userData.active === "غیرفعال"){
        res.status(400).json("کاربر غیرفعال است")
        return
      }
      if(!user){
        return(res.status(400).json("user not found"));
      }

      if (user) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, phone },
          process.env.TOKEN_KEY,
          {
            expiresIn: "72h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }

      else{
        res.status(400).send("Invalid Password");
      }
      //res.status(400).send("Invalid Credentials");
    } catch (err) {
      //console.log((err);
    }
}
//ورود با کد یکبار مصرف
exports.sendOTPApi=async(req,res)=>{
  //console.log(("SendOTPApi")
  
    try {
    var { phone } = req.body;
    var mobilePhone = phone
    const userData = await User.findOne({phone: phone })
    if(userData&&userData.active === "غیرفعال"){
      res.status(400).json("کاربر غیرفعال است")
      return
    }
    var otpValue = Math.floor(Math.random() * 8999)+1000 ;

    if(phone.length===6){
      
      var userDetail = ''
      if(userData){
        userDetail = await userInfo.findOne({phone: phone })
      if(userDetail&&userDetail.mobile)
        mobilePhone = userDetail.mobile
      }
    } 
    
    if(userData){
      api.VerifyLookup({
        token: otpValue,
        template: process.env.template,//"mgmVerify",
        receptor: mobilePhone
    },function(response,status){
      console.log(response)
      console.log(status)
    });
      const newUser = await User.updateOne(
        {phone:phone},{$set:{otp:otpValue}});
        ////console.log((newUser)
      res.status(200).json(newUser);
    }
    console.log(userData)
    if(!userData)  {
      api.VerifyLookup({
        token: otpValue,
        template: process.env.template,//"mgmVerify",
        receptor: mobilePhone
    },function(response,status){
      console.log(response)
      console.log(status)
    });
      const newUser = await User.create(
        {phone:phone,otp:otpValue,email:phone+"@mehrgaz.com"});
      const taskData = await CreateTaskSimple("customer",phone)
      //res.status(200).json({"error":"user not found"});
      const newUserLog = await logSchema.create({
        title: "ثبت مشتری جدید",
        user: newUser._id,
        phone: phone,
        kind:"saleOTP",
        description: "کاربر با شماره تماس "+phone+ "در سامانه ثبت نام کرده است",
        status: "unread",
        date:Date.now()
      })
      ////console.log((newUserLog)
      res.status(200).json({"message":"user created"});
    }
  }
  catch (error){
    //console.log((error)
  }
} 
exports.loginOTPApi=async(req,res)=>{
  //console.log(("LoginOTPApi")
  try {
      // Get user input
      const data ={ phone, otp } = req.body;
  
      // Validate user input
      if (!(phone && otp)) {
        res.status(400).send("All input is required");
        return;
      }
      // Validate if user exist in our database
      const user = await User.findOne({phone: phone }).lean()
      const accessData = user.profile?
        await ProfileAccess.findOne({_id:ObjectID(user.profile)}):''
      user.contractor = (accessData.profileName&&
        accessData.profileName.includes('عامل'))?1:0
      if(user.active === "غیرفعال"){
        res.status(400).json("کاربر غیرفعال است")
        return
      }
      ////console.log((user , phone)
      if (user && otp===user.otp) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, phone },
          process.env.TOKEN_KEY,
          {
            expiresIn: "48h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
        return;
      }
      if(user && otp!==user.otp){
        res.status(400).json({
          "error":"wrong otp"
        });
      }
      //res.status().send("Invalid Credentials");
    } catch (err) {
      //console.log((err);
    }
}
 
//اطلاعات کاربری
exports.userInfoApi=async(req, res) => {
  //console.log(("UserInfoApi")
  try{
    const userData = await user.findOne({_id:req.headers["userid"]});
    const userInfoData = await userInfo.findOne({userId:req.headers["userid"]});
    const userAddressData = await userAddress.find({userId:req.headers["userid"]});
    const jobData = await job.find();
    res.status(200).send({
      user:userData,
      userInfo:userInfoData,
      userAddress:userAddressData,
      jobData:jobData
    });
  }
  catch{
    res.status(200).send({
      message:"error"
    });
  }
}
exports.userInfoSetApi=async(req, res) => {
  //console.log(("UserInfoSetApi")

    try{
    const data = { 
      userName:req.body.userName,
      phone:req.body.phone,
      userId:req.body.userId?req.body.userId:req.headers["userid"],
      meliCode:req.body.meliCode,
      birthDate: req.body.birthDate,
      mobile:req.body.mobile,
      email: req.body.email,
      hesab:req.body.hesab,
      job:req.body.job
    }
    const userData = await userInfo.findOne({userId: data.userId});
    const usersUpdate = await User.updateOne({_id: data.userId },
    {$set:{cName:data.userName,meli:data.meliCode,}})
    ////console.log((userData)
    ////console.log((data)
    if(userData){
      const updateUserInfo= await userInfo.updateOne({userId: data.userId},{$set:data})
      res.status(200).json({updateuser:updateUserInfo});
    }
    else{
      const newUserInfo= await userInfo.create(data);
      const newUserLog = await logSchema.create({
        title: "تکمیل اطلاعات کاربری",
        user: data.userId, 
        phone: data.phone,
        kind:"manager",
        description: "کاربر با شماره تماس "+data.phone+ "در سامانه اطلاعات کاربری ایجاد کرده است",
        status: "unread",
        date:Date.now()
      })
      res.status(200).json({newuser:newUserInfo});
    }
    
  }
  catch(err){
    res.status(200).json({err:err});
  }
}
exports.userPassApi=async(req, res) => {
  //console.log(("UserPassApi")
try{   
  const data = { 
    password:await bcrypt.hash(req.body.password, 10)
  }
  //const users = await User.findOne({_id: req.headers["userid"] })
  ////console.log((users)
  //if(userData){
    const updateUserInfo= await User.updateOne({_id: req.headers["userid"]},{$set:data})
    res.status(200).json({updateuser:updateUserInfo,pass:data.password});
 
}
catch(err){
  res.status(200).json({err:err});
}
}

//آدرس های کاربر
exports.userAddressApi=async(req, res) => {
  //console.log(("UserAddressApi")
  try{
    const userData = await userAddress.find({phone:req.body.phone});
    res.status(200).send({
      userAddress:userData
    });
  }
  catch{
    res.status(200).send({
      message:"error"
    });
  }
}
exports.userAddressSetApi=async(req, res) => {
  //console.log(("UserAddressSetApi")
    try{
  const {phone } = req.body;
    const data = { 
      phone: phone,
      userId:req.body.userId,
      addressUserName:req.body.addressUserName,
      address:req.body.address,
      state:req.body.state,
      city:req.body.city,
      addressPhone:req.body.addressPhone,
      postalCode:req.body.postalCode,
      location:req.body.location
    }
    //const userData = await userAddress.findOne({phone: phone });
    //res.status(200).json({user:data.userName});
    //if(userData){
    //  const updateUserInfo= await userAddress.updateOne({phone:phone},{$set:data})
    //  res.status(200).json({updateuser:updateUserInfo});
    //}
    //else{
      const newUserInfo= await userAddress.create(data);
      res.status(200).json({newuser:newUserInfo});
    //}
    
  }
  catch(err){
    res.status(200).json({err:err});
  }
}
const isMobile=(phone)=>{
  if(!phone) return 0
  if(!/^\d+$/.test(phone))return 0
  var leng = phone.length
  if(leng<10) return 0
  if(phone.charAt(0)==="0"&&phone.charAt(1)==="9")
    return 1
  if(phone.charAt(0)==="9")return 1
}
exports.userEditApi=async(req, res) => {
  //console.log(("UserEditApi")
  try{ 
  const data = { 
    access:req.body.access,
    group:req.body.group,
    password:req.body.password
  }
  //res.status(200).json(data)
   
  var hesabfaCode='';
  const userData= await user.findOne({_id:req.headers["userid"]});
  const userDetail= await userInfo.findOne({userId:req.headers["userid"]});
  var userHesabFa=''
  if(req.body.hesabfa === "new"){
    userHesabFa=await HesabFaApiCall("/contact/save",{contact:{
      Code:userData.cCode,
      Name:userData.cName,  
      City:userDetail.birthDate,
      Address:userDetail.meliCode,
      ContactType:1,
      Mobile:isMobile(userData.phone)?userData.phone:userDetail.mobile
    }})
    ////console.log((userDetail)
    if(userHesabFa)
      hesabfaCode={cCode:userHesabFa.Result.Code}
    //await sendSmsUser(req.headers["userid"],process.env.accessControl,userData.phone,"","")
    ////console.log((req.body)
  }
  const userEdit= await user.updateOne({_id:req.headers["userid"]},{$set:{...data,...hesabfaCode}});
  res.status(200).json({userData:userEdit,hesabFa:userHesabFa,userInfo:userInfo});
  
}
catch(err){
  res.status(200).json({err:err});
}
}

exports.userCreditSetApi=async(req, res) => {
  //console.log(("UserCreditSetApi")
    try{
    const data = { 
      userId:req.body.userId,
      creditValue:req.body.creditValue,
      creditTime: req.body.creditTime,
      creditDesc:req.body.creditDesc
    }
      const userCredit= await userCreditSchema.create(data);
      res.status(200).json({newCredit:userCredit});
    //}
    
  }
  catch(err){
    res.status(200).json({err:"error"});
  }
}
exports.userCreditListApi=async(req, res) => {
  //console.log(("UserCreditListApi")
  try{
  const data = { 
    userId:req.body.userId
  }
    const userCredit= await userCreditSchema.find(data.userId&&{userId:data.userId});
    res.status(200).json({userCredit:userCredit});
  //}
  
}
catch(err){
  res.status(200).json({err:"error"});
}
}
