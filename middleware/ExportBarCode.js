const excel = require('node-excel-export');
const fs = require('fs');
const Orders = require('../model/Order/orders');

// You can define styles as json object
const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: 'FF000000'
          }
        },
        font: {
          color: {
            rgb: 'FFFFFFFF'
          },
          sz: 14,
          bold: true,
          underline: true
        }
      },
      cellPink: {
        fill: {
          fgColor: {
            rgb: 'FFFFCCFF'
          }
        }
      },
      cellGreen: {
        fill: {
          fgColor: {
            rgb: 'FF00FF00'
          }
        }
      }
    };
     
const specification = {
    radif: { // <- the key should match the actual data key
        displayName: 'ردیف', // <- Here you specify the column header
        headerStyle: styles.headerDark, // <- Header style
        
        width: 60 // <- width in pixels
    },
    orderNo: { 
        displayName: 'شماره سفارش', 
        headerStyle: styles.headerDark, 
        
        width: 70 
    },
    userData: { 
        displayName: "مشتری", 
        headerStyle: styles.headerDark, 
        
        width: 70 
    },
    group: { 
        displayName: "گروه", 
        headerStyle: styles.headerDark, 
        
        width: 70 
    },
    credit: {
        displayName: 'وزن یارانه ای',
        headerStyle: styles.headerDark,
        
        width: 70 
    },
    fob: {
        displayName: 'وزن غیر یارانه ای',
        headerStyle: styles.headerDark,
        
        width: 70 
    },
    count:{
        displayName: 'تعداد',
        headerStyle: styles.headerDark,
        width: 70
    },
    status:{
        displayName: 'وضعیت',
        headerStyle: styles.headerDark,
        width: 70
    },
    date:{
        displayName: 'تاریخ',
        headerStyle: styles.headerDark,
        width: 70,
        cellStyle: styles.cellPink
    },
    carNo:{
        displayName: 'شماره ماشین',
        headerStyle: styles.headerDark,
        width: 70,
        cellStyle: styles.cellPink
    },
    description:{
        displayName: 'توضیحات',
        headerStyle: styles.headerDark,
        width: 170
    }
}
    
     
const merges = [
  //{ start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
  //{ start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
  //{ start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
]
     
const exportOrders =async(req,res)=>{
  const orderNo=req.body.orderNo
    const url = `uploads/export/${orderNo[0]}-barcode(${orderNo.length}).xlsx`
     
    const orderData = await Orders.aggregate([
      {$match:{stockOrderNo:{$in:orderNo}}},
      {$lookup:{
        from : "users", 
        localField: "userId", 
        foreignField: "_id", 
        as : "userDetail"
    }},
    ])
    var dataset = orderData.map((item,i)=>(
      {orderNo:item.stockOrderNo,
        group:item.group,
        radif:i+1,
        userData:(item.userDetail&&item.userDetail[0])?
          item.userDetail[0].cName:item.userId,
        credit:item.credit,
        fob:item.freeCredit,
        count:item.stockOrderPrice,
        status:item.status,
        carNo:item.carNo,
        description:item.description,
        date:new Date(item.loadDate).toLocaleDateString('fa')
      }
    ))
    //console.log(dataset)
    const report = excel.buildExport(
    [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
        name: 'Orders', 
        merges: merges, 
        specification: specification, 
        data: dataset 
        }
    ]
    );
    fs.writeFile(url, report, function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
    // You can then return this straight
    //res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
    return res.send({url:url,orderData:orderData,status:"success"});
}
module.exports = exportOrders;