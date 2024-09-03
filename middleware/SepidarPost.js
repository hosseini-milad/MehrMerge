const { default: fetch } = require("node-fetch");
const { SEPIDAR_URL,SEPIDAR_HEADER} = process.env;

const sepidarPOST=async(url,data)=>{
    var header = SEPIDAR_HEADER
    var response = ''; 
    try{    response = await fetch(SEPIDAR_URL+url,
            {method: "POST" ,headers:JSON.parse(header),
        body:JSON.stringify(data)});
        const result = await response.json();
        return(result)
    } 
    catch(error){
        return({error:response&&response.status,
            error_description:response&&(response.status+" "+response.statusText)})
    }
  }
module.exports =sepidarPOST