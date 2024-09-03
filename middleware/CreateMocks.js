
const CreateMock=async(cats,documents)=>{
    
    var apiList = []
    for(var i=0;i<cats.length;i++){
        apiList.push({
            name: cats[i].title,
            description: cats[i].content,
            enTitle:cats[i].enTitle,
            apis:[]
        })
    }
    for(var i=0;i<documents.length;i++){
        var cat = documents[i].category?documents[i].category.enTitle:''
        var catIndex= apiList.findIndex(item=>item.enTitle===cat)
        if(catIndex!==-1)
          apiList[catIndex].apis.push({
            "id": 1,
            "type": documents[i].kind.toLowerCase(),
            "path": documents[i].url,
            "description": documents[i].content,
            "parameters": documents[i].parameters,
            "request": documents[i].request,
            "response": documents[i].response
            
        })
    }
    //console.log(apiList)

    return(apiList)
}
module.exports = CreateMock;