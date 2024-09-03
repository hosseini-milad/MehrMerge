const user =require("../../model/user");
const userInfo =require("../../model/userInfo");
var Kavenegar = require('kavenegar');
var api = Kavenegar.KavenegarApi({
    apikey: process.env.SMS_API
});
 
async function sendMessageUser(userId,message){
    const userData= await user.findOne({_id:userId});
    const userInfoData= await userInfo.findOne({userId: userId });
    //console.log(userInfoData)
    var phoneNumber=""
    if(userInfoData&&userInfoData.mobile){
      phoneNumber= userInfoData.mobile
    } 
    else{
      if(isMobile(userData.phone))phoneNumber=userData.phone;
    }
    const requestJson = {message: message,
      sender: process.env.SMS_Sender, 
      receptor: phoneNumber}
      console.log(requestJson)
    if(phoneNumber){
      api.Send(requestJson,function(response,status) {
        console.log(response);
        console.log(status);
        }) 
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
  module.exports = sendMessageUser