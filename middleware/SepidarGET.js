const { default: fetch } = require("node-fetch");
const { SEPIDAR_URL,SEPIDAR_HEADER} = process.env;

const sepidarGET=async(url)=>{
    var header = SEPIDAR_HEADER
    var response = ''; 
    try{    response = await fetch(SEPIDAR_URL+url,
            {method: "GET" ,headers:JSON.parse(header)});
        const result = await response.json();
        return(result)
    } 
    catch(error){
        return({error:response&&response.status,
            error_description:response&&(response.status+" "+response.statusText)})
    }
  }
module.exports =sepidarGET