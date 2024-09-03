const path=require('path');
const fs = require('fs');
const AdminBro=require('admin-bro');

const after = async(response,request,context)=>{
    const {record,uploadImage} = context;
    if(record.isValid()&&uploadImage){
        const filePath = path.join('uploads/gallery',uploadImage.name)
        await fs.promises.mkdir(path.dirname(filePath),{recursive:true});
        await fs.promises.rename(uploadImage.path, filePath)
        await record.update({imageUrl:`/${filePath}`})
    }    
    return response
}
const before = async(request,context)=>{
    if(request.method==='post'){
        const{uploadImage, ...otherParams} = request.payload;
        context.uploadImage = uploadImage;

        return{
            ...request,
            payload: otherParams,

        }
    }
}

module.exports={after,before}