const express = require("express");
const apiRoutes = require('./router/mainRouter');
const apiProduct = require('./router/productApi');
const apiOrder = require('./router/orderApi');
const apiSetting = require('./router/settingApi');
const apiSepidar = require('./router/sepidarApi')
const orderPanelApi = require('./router/panelOrderApi')
const productPanelApi = require('./router/panelProductApi')
const UserPanelApi = require('./router/panelUserApi')
const CRMPanelApi = require('./router/panelCrmApi')
const ReportPanelApi = require('./router/panelReportApi')
const apiPayment = require('./router/paymentApi')
const path = require('path');

const apiHesabfa = require('./router/hesabFaApi')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const expressAdmin = require('@admin-bro/express');
const cors = require("cors");
const multer = require('multer');
const adminBro = require('./AdminPanel/admin')
var storage = multer.diskStorage(
    {
        destination: 'uploads/client/',
        filename: function ( req, file, cb ) {
            cb( null, "mgm"+ '-' + Date.now()+ '-'+file.originalname);
        }
    }
);
const uploadImg = multer({ storage: storage })

const fs = require('fs');
const mime = require('mime');
const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

global.publicDir = __dirname + "/payment/";
const paymentRoutes = require('./router/paymentApi');
app.use(express.static(path.join(__dirname, 'publicPay')));
app.set('views', path.join(__dirname, 'publicPay'));
app.set('view engine', 'ejs');

app.use('/pay', paymentRoutes);
const router = expressAdmin.buildRouter(adminBro);

app.use(adminBro.options.rootPath,router)
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));
app.get('/admin',(req,res)=>{
    res.send('Dashboard Connect');
})
/*app.post('/api/image',uploadImg.single('image'),(req,res)=>{
    //console.log(req.file)
    if(!req.file){
        res.send({code:500,msg:'err'})
    }else{
        res.send({code:200,msg:'upload success',url:req.file.path})
    }
})*/
app.post('/api/image',jsonParser, async(req, res, next)=>{
    
    // to declare some path to store your converted image
    var matches = req.body.base64image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};
     console.log(req.body.imgName)
    if (matches.length !== 3) {
    return new Error('Invalid input string');
    }
     
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    let fileName = `MGM-${Date.now().toString()+"-"+req.body.imgName}`;
    //console.log(fileName)
    try {
    fs.writeFileSync("./uploads/client/" + fileName, imageBuffer, 'utf8');
    return res.send({"status":"success",url:"uploads/client/"+fileName});
    } catch (e) {
        res.send({"status":"failed",error:e});
    }
})
app.use('/api', apiRoutes)
app.use('/api/order', apiOrder)
app.use('/api/setting', apiSetting)
app.use('/api/product', apiProduct)
app.use('/api/panel/order',orderPanelApi)
app.use('/api/panel/product',productPanelApi)
app.use('/api/panel/user',UserPanelApi)
app.use('/api/panel/crm',CRMPanelApi)
app.use('/api/panel/report',ReportPanelApi)
app.use('/api/sepidar',apiSepidar)
app.use('/api/hesabfa',apiHesabfa)
app.use('/api/payment',apiPayment)

app.use(express.json());

// Logic goes here

module.exports = app;