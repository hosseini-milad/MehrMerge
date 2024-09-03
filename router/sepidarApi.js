
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const bodyParser = require('body-parser');
const basicUrl = require('../config/sepidarApi');
const jsonParser = bodyParser.json();
const crypto = require('crypto');
const exportExcelApi = require('./excelExport')
var getPem = require('rsa-pem-from-mod-exp');
const sepidar = require('../model/sepidar');
const sepidarstock = require('../model/Order/sepidarstock');
const manufacture = require('../model/Order/manufacture');
const exportOrders = require('../middleware/ExportBarCode');

router.post('/order-export',exportOrders) 
const sampleOut={
    "status": true,
    "message": "Succeed",
    "data": [
       
        {
            "ItemID": 54658,
            "Code": "150000",
            "Barcode": null,
            "Title": "RIVO_Photochromic 2/2__1/56",
            "IsActive": true,
            "IsSellable": true,
            "Type": 1,
            "UnitRef": 1,
            "SecondaryUnitRef": null,
            "UnitsRatio": null,
            "Weight": null,
            "Volume": null,
            "Tracings": [],
            "TracingInventories": [],
            "TotalInventory": 0,
            "PropertyValues": [
                {
                    "PropertyRef": 1,
                    "Value": "-5.00"
                },
                {
                    "PropertyRef": 2,
                    "Value": "-0.75"
                },
                {
                    "PropertyRef": 3,
                    "Value": "1.56"
                },
                {
                    "PropertyRef": 4,
                    "Value": "Photochromic 2/2"
                },
                {
                    "PropertyRef": 8,
                    "Value": "70"
                }
            ],
            "Thumbnail": null,
            "IsTaxExempt": false,
            "TaxRate": 0,
            "DutyRate": 0,
            "BrokerSellable": true,
            "SaleGroupRef": null,
            "CodingGroupRef": 164,
            "PurchaseGroupRef": null
        },
        {
            "ItemID": 54659,
            "Code": "1600000",
            "Barcode": null,
            "Title": "RIVO_Photochromic 2/2__1/56",
            "IsActive": true,
            "IsSellable": true,
            "Type": 1,
            "UnitRef": 1,
            "SecondaryUnitRef": null,
            "UnitsRatio": null,
            "Weight": null,
            "Volume": null,
            "Tracings": [],
            "TracingInventories": [],
            "TotalInventory": 0,
            "PropertyValues": [
                {
                    "PropertyRef": 1,
                    "Value": "-5.00"
                },
                {
                    "PropertyRef": 2,
                    "Value": "-1.00"
                },
                {
                    "PropertyRef": 3,
                    "Value": "1.56"
                },
                {
                    "PropertyRef": 4,
                    "Value": "Photochromic 2/2"
                },
                {
                    "PropertyRef": 8,
                    "Value": "70"
                }
            ],
            "Thumbnail": null,
            "IsTaxExempt": false,
            "TaxRate": 0,
            "DutyRate": 0,
            "BrokerSellable": true,
            "SaleGroupRef": null,
            "CodingGroupRef": 164,
            "PurchaseGroupRef": null
        },
        {
            "ItemID": 54660,
            "Code": "2120898",
            "Barcode": null,
            "Title": "RIVO_Photochromic 2/2__1/56",
            "IsActive": true,
            "IsSellable": true,
            "Type": 1,
            "UnitRef": 1,
            "SecondaryUnitRef": null,
            "UnitsRatio": null,
            "Weight": null,
            "Volume": null,
            "Tracings": [],
            "TracingInventories": [],
            "TotalInventory": 0,
            "PropertyValues": [
                {
                    "PropertyRef": 1,
                    "Value": "-5.00"
                },
                {
                    "PropertyRef": 2,
                    "Value": "-1.25"
                },
                {
                    "PropertyRef": 3,
                    "Value": "1.56"
                },
                {
                    "PropertyRef": 4,
                    "Value": "Photochromic 2/2"
                },
                {
                    "PropertyRef": 8,
                    "Value": "70"
                }
            ],
            "Thumbnail": null,
            "IsTaxExempt": false,
            "TaxRate": 0,
            "DutyRate": 0,
            "BrokerSellable": true,
            "SaleGroupRef": null,
            "CodingGroupRef": 164,
            "PurchaseGroupRef": null
        },
    ]
}

router.get('/sepidar-export',exportExcelApi)

const sepidarRegisterApi=async(req,res)=>{
    console.log("Sepidar1Api")
    const { sepidarSerial ,sepidarID,sepidarIV} = process.env;
    const {sepidarIp,sepidarPort,sepidarRegister} = process.env;
    const key = sepidarSerial+sepidarSerial;
    const plainText = sepidarID;
    var cipher = crypto.createCipheriv('aes-128-cbc',key,sepidarIV);
    var crypted = cipher.update(plainText,'ascii','base64');  //base64 , hex
    crypted += cipher.final('base64');
    const buff = Buffer.from(sepidarIV, 'utf-8');
    const base64IV = buff.toString('base64');
    //res.json({Cypher:crypted,IV:base64IV})

    const initialPost =JSON.stringify({
        Cypher:crypted,
        IV:base64IV,
        IntegrationID:1003
    })
    const response = await fetch(`${sepidarIp}:${sepidarPort}${sepidarRegister}`,
         {method: 'POST', body: initialPost });
    const data = await response.json();
        
    try{
        res.json({data:data,post:initialPost})
    }
    catch(error){
        res.json(error)
    }
}
router.get('/sepidar-register',sepidarRegisterApi)

const updateStocks=async(allList)=>{
    console.log("Sepidar2Api")
    const stockData = [];
    const stockList = allList.data.filter(item=>item.Code?(item.Code.charAt(0)==="2"):'');
    //console.log(stockList)
    if(!stockList) return('')
    for(var indx=0;indx<stockList.length;indx++){
        var stockRaw = await sepidarstock.findOne({sku:stockList[indx].Code})
        !stockRaw&& stockData.push(stockList[indx])
    }
    return(stockData)
}
const updateRX=async(allList)=>{
    console.log("Sepidar3Api")
    const rxData = [];
    const rxList = allList.data.filter(item=>item.Code?(item.Code.charAt(0)==="1"):'');
    //console.log(stockList)
    if(!rxList) return('')
    for(var indx=0;indx<rxList.length;indx++){
        var stockRaw = await manufacture.findOne({sku:rxList[indx].Code})
        !stockRaw&& rxData.push(rxList[indx])
    }
    return(rxData)
}

const updateSepidarApi=async(req,res)=>{
    console.log("Sepidar4Api")
    const { sepidarSerial ,sepidarID,sepidarIV} = process.env;
    const {sepidarSharif,sepidarIp,sepidarPort,sepidarRegister} = process.env;
    const type=req.body.type;
    var initialPost =''
    var response = {} 
    //const token = await sepidar.findOne({registerCode:sepidarSerial})
    var token= await loginSepidarApi(0);
    //console.log(token)
    if(token){
        initialPost={
            Url:`${sepidarIp}:${sepidarPort}`,
            Register_Code:sepidarSerial,
            Exponent:token.exponent,
            Modulus:token.modulus,
            Token:token.token
        }
        response = await fetch(`${sepidarSharif}/${req.body.api}`,
            {method: 'post', 
            body: JSON.stringify(initialPost) ,
            headers: {'Content-Type': 'application/json'}});
        const data = await response.json();
        var notIn = (type==="RX")?await updateRX(data):await updateStocks(data);
        res.json({notIn:notIn})
    }
        
    else{res.json(token)}
    try{    
    }
    catch(error){
        res.json("error catch")
    }
}
router.post('/update-sepidar',updateSepidarApi)
const loginSepidarApi=async(error)=>{
    console.log("Sepidar6Api")
    const {sepidarSharif,sepidarIp,sepidarPort,sepidarSerial} = process.env;
    const token = await sepidar.findOne({registerCode:sepidarSerial})
    //console.log(error,token,sepidarSerial)
    if(!error&&token&&token.token) return(token)

    if(error&&token&&token.token){ 
        const initialPost={
            Url:`${sepidarIp}:${sepidarPort}`,
            Register_Code:sepidarSerial,
            Username:"int",
	        Password:"13579",
            Exponent:"AQAB",//token.exponent,
            Modulus:'0LOYcmIszMz\/vYRtELY4c0egbEMjM8urpTs4yd0xsJVUNyk1A5NpMOszsgJ8ZNdhf0HsBhe5+TdcK12Rw6eh7Q=='//token.modulus
        }
        const response = await fetch(`${sepidarSharif}/login`,
            {method: 'POST', body: JSON.stringify(initialPost)  ,
            headers: {'Content-Type': 'application/json'}});
        const loginJson = await response.json();
        const updateValue=loginJson.success?{
            token: loginJson.data.message.split(' || ')[1],
            modulus:initialPost.Modulus,
            exponent: initialPost.Exponent,
            registerCode: sepidarSerial  
        }:{}
        //console.log(updateValue)
        await sepidar.updateOne({registerCode:sepidarSerial},{$set:updateValue}) 
        return(updateValue)
        //await sepidar.create(updateValue) 
    }
    if(error&&!token){
        const regBody = {Url:`${sepidarIp}:${sepidarPort}`,
        Register_Code:sepidarSerial}
        //console.log(`${sepidarSharif}/register`)
        const responseRegister = await fetch(`${sepidarSharif}/register`,
            {method: 'POST', body: JSON.stringify(regBody) ,
            headers: {'Content-Type': 'application/json'}});
        const registerJson = await responseRegister.json();
        
        console.log(registerJson)
        return({}) 
        const loginPost={
            Url:`${sepidarIp}:${sepidarPort}`,
            Register_Code:sepidarSerial,
            Username:"int",
	        Password:"13579",
            Exponent:registerJson.data.Exponent,
            Modulus:registerJson.data.Modulus
        }
        console.log(loginPost)
        const responseLogin = await fetch(`${sepidarSharif}/login`,
            {method: 'POST', body: JSON.stringify(loginPost)  ,
            headers: {'Content-Type': 'application/json'}});
        const loginJSON = await responseLogin.json();
        const loginCreate={
            token: loginJSON.message.split(' || ')[1],
            modulus:registerJson.data.Modulus,
            exponent: registerJson.data.Exponent,
            registerCode:  sepidarSerial
        }
        await sepidar.create(loginCreate);
        //console.log(loginJSON)
        return(loginJSON)/**/
    }


    try{    return({result:db,status:true})
    }
    catch(error){
        return({error:error,status:false})
    }
}
const registerSepidarApi=async(req,res)=>{
    const { sepidarSerial ,sepidarID,sepidarIV} = process.env;
    const {sepidarSharif,sepidarIp,sepidarPort,sepidarRegister} = process.env;
    const initialPost =JSON.stringify({
        Url:`${sepidarIp}:${sepidarPort}`,
        Register_Code:sepidarSerial,
    })   
    try{
        const response = await fetch(`${sepidarSharif}`,
            {method: 'POST', body: initialPost });
        const data = await response.json();
        if(!data.success) return({error:data.data.message})
        //const createData = await sepidar.find({registerCode:sepidarSerial})
        const modulus = data.data.Modulus;
        const exponent = data.data.Exponent;
        
        return({modulus:modulus,exponent:exponent})
    }
    catch(error){
        return(error)
    }
}

const sepidarRegisterApi2=async(req,res)=>{
    console.log("Sepidar8Api")
    const { sepidarSerial ,sepidarID,sepidarIV} = process.env;
    const {sepidarIp,sepidarPort,sepidarRegister} = process.env;
    const key = sepidarSerial+sepidarSerial;
    const plainText = sepidarID;
    var cipher = crypto.createCipheriv('aes-128-cbc',key,sepidarIV);
    var crypted = cipher.update(plainText,'ascii','base64');  //base64 , hex
    crypted += cipher.final('base64');
    const buff = Buffer.from(sepidarIV, 'utf-8');
    const base64IV = buff.toString('base64');
    //res.json({Cypher:crypted,IV:base64IV})

    const initialPost =JSON.stringify({
        Cypher:crypted,
        IV:base64IV,
        IntegrationID:1003
    })
    const response = await fetch(`${sepidarIp}:${sepidarPort}${sepidarRegister}`,
         {method: 'POST', body: initialPost });
    const data = await response.json();
        
    try{
        res.json({data:data,post:initialPost})
    }
    catch(error){
        res.json(error)
    }
}
router.get('/sepidar-register',sepidarRegisterApi2)



const isAuth=async(req,res)=>{
    console.log("Sepidar11Api")
    const {sepidarIp,sepidarPort,sepidarCheck} = process.env;
    const initialPost =JSON.stringify({
        GenerationVersion:105,
        Authorization:"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjU3LCJwaWQiOm51bGwsInV2ZXIiOjIsImR1cGlkIjoxMywiZHVwdmVyIjoxfQ.g9EPEaNTLLS7q4no89EwZvPSEAKDR8rGj56MWGNgHMM",
        IntegrationID:"1003",
        ArbitraryCode:"F8904511-405C-734C-722F-D094444416E2",
        EncArbitraryCode:"WAqLXhjniykzjMahU9O0YdGALhLljWsCstHPqQ2dmb7wYw84RnjbHdZRR1Evgf50oJtPCwZ87lNHZn0u97nKDA=="
    })
    const response = await fetch(`${sepidarIp}:${sepidarPort}${sepidarCheck}`,
         {method: 'GET', header: initialPost });
    const data = await response.json();
        
    try{
        res.json({data:data,post:initialPost})
    }
    catch(error){
        res.json(error)
    }
try{
        /*let decipher = crypto.createDecipheriv('aes-128-cbc',key,iv)
        decipher.setAutoPadding(false)
        let decoded  = decipher.update(crypted,'base64','utf8') //base64 , hex
        decoded  += decipher.final('utf8')
        console.log("Encrypted string (base64):", decoded);
        res.json(crypted)*/


        /*const key = sepidarSerial+sepidarSerial;
        const plainText = sepidarID;
        const encrypted = encrypt(plainText, key, "base64");
        console.log("Encrypted string (base64):", encrypted);
        const decrypted = decrypt(Buffer.from(encrypted, "base64"), key, "utf8")
        console.log("Decrypted string:", decrypted);*/
    }
    catch(error){
        res.json(error)
    }
}
router.get('/isAuth',isAuth)

const regOnlineApi=async(req,res)=>{
    console.log("Sepidar13Api")
    const { sepidarSerial ,sepidarID} = process.env;
    const key=sepidarSerial+sepidarSerial;
    const sepidarAuthIV="7zzo30dEztSqtFt/GhvH/Q==";
    const sepidarAuthCypher="+HVVV0VEREmZKplF3mjkoXeMDdkQHtPcCzuM/FKKpYt1pSkH+zcUfBn3uVPCRaDWoAlLsc/SUofx2In9gaWfmkwdkUaWV8REYIMCSmemKrWh3CvTON8TFbEUHu+0f4G41a0SovqGIWo8OBz7+nRhRJ+IVkq2j+zMar+OHrWNHRxpBIyzE1OLa9sJkIT6YN+OS8GJPzYfePOIw2q0ZBhq7A==";
    //const ReyhamIV = Buffer.from("ReyhamIV")
    let ivBuff = Buffer.from(sepidarAuthIV, 'base64');
    let iv = ivBuff.toString('ascii');
    
    /*res.status(200).json({cKey:key,
        decypher:iv.length
    })*/
    let decipher = crypto.createDecipheriv('aes-128-cbc',key,iv)
        //decipher.setAutoPadding(false)
        let decoded  = decipher.update(sepidarAuthCypher,'base64','utf8') //base64 , hex
        decoded  += decipher.final('utf8')
        //console.log("Encrypted string (base64):", decoded);
    
    try{ 
        res.status(200).json({cKey:key,
            decypher:decoded
        })
    }
    catch{}
   
}
router.get('/regonline',regOnlineApi)

const loginSepidar=async(req,res)=>{
    console.log("Sepidar14Api")
    const { sepidarSerial ,sepidarID} = process.env;
    
    const plainText = sepidarID;
    const rsaModulus="jvTm/d53nM47NZ4QfnkT6zYXvGDT5O/CZLeiZgoZm6j73o6sHFnby03dtokJBiRbubAq7Bx3ZSY83YM6/GlsZQ=="
    const rsaExponent="AQAB"
    const GUID="991516"
    const UUID=crypto.randomUUID()
    var pem = rsaPublicKeyPem(rsaModulus, rsaExponent);


    const encNewData = crypto.publicEncrypt(pem,Buffer.from(GUID))
    const buff = Buffer.from(encNewData, 'utf-8');
    const enc64 = buff.toString('base64');
    var encMsgB64 = encNewData.toString('base64');
    
    res.json({pem:pem,eData:enc64})
}
router.get('/loginSepidar',loginSepidar)


const versionApi=async(req,res)=>{
    console.log("Sepidar16Api")
    try{
        fetch(basicUrl.url+basicUrl.apiVersion)
        .then(res => res.text())
        .then(text => res.json(JSON.parse(text)));
    }
    catch(error){
        res.json(error)
    }
}
router.get('/version',versionApi)

const customersApi=async(req,res)=>{
    console.log("Sepidar17Api")
    try{
        fetch(basicUrl.url+basicUrl.apiCustomers)
        .then(res => res.text())
        .then(text => res.json(JSON.parse(text)));
    }
    catch(error){
        res.json(error)
    }
}
router.get('/customers',customersApi)

const cryptoRSA=async(req,res)=>{
    console.log("Sepidar18Api")
    const {sepidarModulus,sepidarExponent} = process.env;
    const { publicKey, prKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 512,
    })
    var pemKey = getPem(sepidarModulus, sepidarExponent);

    /*res.json({pemKey:pemKey,publicKey:publicKey.export({
		type: "pkcs1",
		format: "pem",
	})})*/

    try{    
        
        const data = "my Name is M.ilad"

        const encryptedData = crypto.publicEncrypt(
            {
                key: pemKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                
            },
            // We convert the data string to a buffer using `Buffer.from`
            Buffer.from(data)
        )
        console.log("encypted data: ", encryptedData.toString("base64"))
        res.json("done")
        //console.log("decrypted data: ", decryptedData.toString())
    }
    catch(error){
        res.json({error:error})
    }
}
router.get("/rsa",cryptoRSA)

const RSA=(key)=>{
    console.log("Sepidar19Api")
    var tempKey="<R����y����徼M�dulus>p9yp2Blc9VZqv7mkUnDkr74M6G003Z09WMkfiMYGUtuJgh9/9NtoTW+seJVSyriZ+8XqrvAghCbo72jhNTZ1Bw==</Modulus><Exponent>AQAB</Exponent></RSAKeyValue>"
    
    var modulus = tempKey.split('us>')[1];
    modulus = modulus.split('</')[0];
    var exponent = tempKey.split('nt>')[1];
    exponent = exponent.split('</')[0];
    const {sepidarModulus,sepidarExponent} = process.env;
    const { publicKey, prKey } = crypto.generateKeyPairSync("rsa", {
        // The standard secure default length for RSA keys is 2048 bits
        modulusLength: 512,
    })
    var pemKey = getPem(modulus, exponent);
    try{    
        /*console.log({pem:pemKey,publicKey:publicKey.export(
            {
                type: "pkcs1",
                format: "pem",
            }
        )})*/
        const data = "09B2AA12-D1F6-139F"

        const encryptedData = crypto.publicEncrypt(
            {
                key: pemKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                
            },
            // We convert the data string to a buffer using `Buffer.from`
            Buffer.from(data)
        )
        //console.log("encypted data: ", encryptedData.toString("base64"))
        return([data,encryptedData.toString("base64")])
        //console.log("decrypted data: ", decryptedData.toString())
    }
    catch(error){
        return({error:error})
    }
}

const cryptoAES=async(req,res)=>{
    console.log("Sepidar111Api")
    const { sepidarSerial ,sepidarID,sepidarIV,sepidarIVBase64} = process.env;
    const {sepidarIp,sepidarPort,sepidarRegister,sepidarLogin} = process.env;

    const cipher = crypto.createCipheriv(
        'aes-128-cbc', 
        sepidarSerial+sepidarSerial, 
        sepidarIV);
    let encrypted = cipher.update(sepidarID, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
        /*const response = await fetch(`${sepidarIp}:${sepidarPort}${sepidarRegister}`,
         {method: 'POST', body: JSON.stringify({
            Cypher:encrypted,
            IV:sepidarIVBase64,
            IntegrationID:sepidarID
        }) });
        const data = await response.json();*/
        var utf8encoded = Buffer.from("XhPx26CkK+Hwgo+uqM0suw==", 'base64').toString('ascii');
        
        const decipher = crypto.createDecipheriv(
            'aes-128-cbc', 
            sepidarSerial+sepidarSerial, 
            utf8encoded);
        let decrypted = decipher.update(
            "7/HuBpIZV8lYSF/kJ4HbU95PxSC4kQzuMyovmenvcCB79/mcuGDPJN50HwAwkcUSCE24eGTVSDPIM+6O7wKGmhklQuLS9y4ilarOZIUb04qYCofAkCr2KlB8qeyh9SBC8ClxfO7svqPBshA8KFNMafrn83yWrDozggF33LVf+DTJUklt5YwdRiI+HlLRm7F8nhIMSbELlHtyJ6ZCH+ZP0Q=="
            , 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        const rsaResult = await RSA(decrypted.response)
        
        const headers={
            GenerationVersion:"103",
            IntegrationID: sepidarID,
            ArbitraryCode: rsaResult[0],
            EncArbitraryCode:rsaResult[1],
            'Content-Type': 'application/json'
        }
        const body={
            UserName:"int",
            PasswordHash: "e13dd027be0f2152ce387ac0ea83d863"
        }
        const fResponse = await fetch(`${sepidarIp}:${sepidarPort}${sepidarLogin}`,
        {method: 'POST', body: JSON.stringify(body), headers:headers });
       const data = await fResponse.json();
        //console.log(data)
        try{  
        res.json(data)
    }
    catch(error){
        res.json({error:error})
    }
}
router.get("/aes",cryptoAES)


module.exports = router



const cryptoApi=async(req,res)=>{
    const { sepidarSerial ,sepidarID,sepidarIV} = process.env;
    const {sepidarIp,sepidarPort,sepidarRegister} = process.env;
    const key = sepidarSerial+sepidarSerial;
    const plainText = sepidarID;
    var cipher = crypto.createCipheriv('aes-128-cbc',key,sepidarIV);
    var crypted = cipher.update(plainText,'utf8','base64');  //base64 , hex
    crypted += cipher.final('base64');
    const buff = Buffer.from(sepidarIV, 'utf-8');
    const base64IV = buff.toString('base64');
    //res.json({Cypher:crypted,IV:base64IV})

    const initialPost =JSON.stringify({
        Cypher:crypted,
        IV:base64IV,
        IntegrationID:1003
    })
    const response = await fetch(`${sepidarIp}:${sepidarPort}${sepidarRegister}`,
         {method: 'POST', body: initialPost });
    const data = await response.json();
        
    try{
        res.json({data:data,post:initialPost})
    }
    catch(error){
        res.json(error)
    }
}
router.get('/crypto',cryptoApi)
