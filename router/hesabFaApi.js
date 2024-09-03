
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const hesabfaGetApi=async(req,res)=>{
    console.log("HesabFaGetApi")
    const url = req.body.url;
    const { hesabServer ,hesabApi,tokenApi} = process.env;
    const headers={
        'Content-Type': 'application/json'
    } 
    const initialPost=JSON.stringify({
        apiKey: hesabApi,
        loginToken: tokenApi
    })
    
    const response = await fetch(hesabServer+url,
         {method: 'POST', body: initialPost, headers:headers });
    const data = await response.json();
        
    try{
        res.json({data:data,url:`${hesabServer+url}`,body:initialPost})
    }
    catch(error){
        res.json(error)
    }
}
router.post('/getApi',hesabfaGetApi)


const hesabfaSetApi=async(req,res)=>{
    console.log("HesabFaSetApi")
    const url = req.body.url;
    const { hesabServer ,hesabApi,tokenApi} = process.env;
    const headers={
        'Content-Type': 'application/json'
    }
    const initialPost=JSON.stringify({
        apiKey: hesabApi,
        loginToken: tokenApi,
        items:req.body.items
    })
    //console.log(initialPost)
    const response = await fetch(hesabServer+url,
         {method: 'POST', body: initialPost, headers:headers });
    const data = await response.json();
        
    try{
        res.json({data:data})
    }
    catch(error){
        res.json(error)
    }
}
router.post('/saveApi',hesabfaSetApi)


module.exports = router;