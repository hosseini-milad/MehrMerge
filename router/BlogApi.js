
const help = require('../model/help');
const Posts = require('../model/products/Post');

exports.blogListApi=async(req,res)=>{
    console.log("BlogListApi")
    try{
        
        const PostData = await Posts.find();
        
        res.json({
            posts:PostData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.helpListApi=async(req,res)=>{
    console.log("HelpListApi")
    try{
        const helpData = await help.find();
        
        res.json({
            helps:helpData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}