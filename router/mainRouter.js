require("dotenv").config();
require("../config/database").connect();
const express = require('express');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
 
const panelFaktorApi = require('./faktorApi')
const auth = require("../middleware/auth");

const { registerApi ,loginApi,loginManager, loginOTPApi, sendOTPApi, userInfoApi, 
    userInfoSetApi,userAddressApi,userAddressSetApi,userCreditSetApi,
    userCreditListApi,userEditApi,userPassApi} = require("./authApi");
router.post('/auth/register',jsonParser,registerApi)
router.post("/auth/login",jsonParser, loginApi);
router.post("/auth/loginmanager",jsonParser, loginManager);
router.post("/auth/otpLogin",jsonParser,loginOTPApi);
router.post("/auth/otpSend",jsonParser,sendOTPApi);

router.get("/auth/userInfo",jsonParser, auth, userInfoApi);
router.post("/auth/userInfo/set",jsonParser, auth, userInfoSetApi);

router.post("/auth/userAddress",jsonParser, auth, userAddressApi);
router.post("/auth/userAddress/set",jsonParser, auth, userAddressSetApi);

router.post("/credit/set",jsonParser,userCreditSetApi)
router.post("/credit/list",jsonParser,userCreditListApi)
router.post("/user/edit",jsonParser,userEditApi)
router.post("/user/password",jsonParser,userPassApi)

router.get("/auth/welcome", auth, async(req, res) => {
    //console.log("WelcomeApi")
    try{
        res.status(200).send({
            message:"ok"
        });
    }
    catch{
        res.status(200).send({
            message:"false"
        });
    }
    
  });

const { mainApi ,layoutApi,categoryPageApi,userOrderApi,reportApi,
    userMainInfo,customersApi,userDetailInfo} = require("./mainApi");
const user = require("../model/user");
const { blogListApi,helpListApi } = require("./BlogApi");
router.get('/home',mainApi)
router.get('/layout',layoutApi)
router.get('/bloglist',blogListApi)
router.get('/helplist',helpListApi)

router.get('/categoryList',categoryPageApi)

router.use('/panel/faktor', panelFaktorApi)
router.get('/userOrders',userOrderApi)
router.post('/userInfo',userMainInfo)
router.post('/report/order',reportApi)
router.post('/report/customers',customersApi)
router.post('/report/userDetail',userDetailInfo)

module.exports = router;