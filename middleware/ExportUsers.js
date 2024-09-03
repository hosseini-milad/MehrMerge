const excel = require('node-excel-export');
const fs = require('fs');
const StockSchema = require('../model/Order/sepidarstock');
const user = require('../model/user');
const calcCredit = require('./CalcCredit');

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
      cellBlue: {
        fill: {
          fgColor: {
            rgb: 'FF90CA'
          }
        }
      },
      cellRed: {
        fill: {
          fgColor: {
            rgb: 'FFCCCB'
          }
        }
      },
      cellGreen: {
        fill: {
          fgColor: {
            rgb: '5CED73'
          }
        }
      }
    };
     
const specification = {
    colName: { // <- the key should match the actual data key
        displayName: 'نام مشترک', // <- Here you specify the column header
        headerStyle: styles.headerDark, // <- Header style
        
        width: 60 // <- width in pixels
    },
    colMeli: { 
        displayName: 'کدملی', 
        headerStyle: styles.headerDark, 
        
        width: 70 
    },
    colPhone: { 
        displayName: 'شماره تماس', 
        headerStyle: styles.headerDark, 
        
        width: 70 
    },
    colCredit1: { 
        displayName: "اعتبار یارانه ای", 
        headerStyle: styles.cellBlue, 
        
        width: 70 
    },
    colFob: { 
        displayName: "اعتبار غیر یارانه ای", 
        headerStyle: styles.cellBlue, 
        
        width: 70 
    },
    colCredit: { 
        displayName: "اعتبار اعطایی", 
        headerStyle: styles.cellBlue, 
        
        width: 70 
    },
    colRemainCredit: { 
        displayName: "اعتبار یارانه مانده", 
        headerStyle: styles.headerDark, 
        
        width: 120 
    },
    colRemainFob: { 
        displayName: "اعتبار غیر یارانه مانده", 
        headerStyle: styles.headerDark, 
        
        width: 120 
    },
    colOrderCredit: { 
        displayName: "اعتبار یارانه سفارشات", 
        headerStyle: styles.cellRed, 
        
        width: 120 
    },
    colOrderFob: { 
        displayName: "اعتبار غیر یارانه سفارشات", 
        headerStyle: styles.cellRed, 
        
        width: 120 
    },
    /*colOrderCount: { 
        displayName: "تعداد سفارش", 
        headerStyle: styles.headerDark, 
        
        width: 70 
    },*/
    colTotalCredit: { 
        displayName: "اعتبار یارانه نهایی", 
        headerStyle: styles.cellGreen, 
        
        width: 120 
    },
    colTotalFob: { 
        displayName: "اعتبار غیریارانه نهایی", 
        headerStyle: styles.cellGreen, 
        
        width: 120 
    },
}
    
     
const merges = [
  //{ start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
  //{ start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
  //{ start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
]
const p2e = (s) => s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)) 
const exportUsers =async(req,res)=>{

  const dateNow = new Date().toLocaleDateString('fa')
  const enDate = p2e(dateNow).replace(/\D/g,'-')
    const url = `uploads/export/customer${enDate}-export.xlsx`
    const userRaw = await user.find({}).lean()
    var userList= []
    for(var i=0;i<userRaw.length;i++){
      //if(!userRaw[i].meli||userRaw[i].meli.length<7)continue
      const totalCredit = await calcCredit(userRaw[i]._id)
      userList.push({...userRaw[i],totalCredit})
    }

    var dataUsers = userList.map((item,i)=>(
        {colName:item.cName,
        colMeli: item.meli, 
        colPhone: item.phone, 
        colCredit1: item.credit1,
        colFob:item.fob,
        colCredit:item.credit,
        colRemainCredit:item.remainCredit,
        colRemainFob:item.remainFob,
        colOrderCredit:item.totalCredit?item.totalCredit.detail.oldFob:"0",
        colOrderFob:item.totalCredit?item.totalCredit.detail.oldCredit:"0", 
        //colOrderCount:item.totalCredit?item.totalCredit.orderCount:0,
        colTotalCredit:item.totalCredit?item.totalCredit.credit:"0",
        colTotalFob:item.totalCredit?item.totalCredit.fob:"0"}
    ))
    
    //console.log(dataUsers)
    const report = excel.buildExport(
    [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
        name: 'Customers', 
        merges: merges, 
        specification: specification, 
        data: dataUsers
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
    return({url:url,status:"success"});
}
module.exports = exportUsers;