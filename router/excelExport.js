const excel = require('node-excel-export');
const fs = require('fs');
const ManSchema = require('../model/Order/manufacture');

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
     
    //Array of objects representing heading rows (very top)
    const heading = [
      ['radif', 'code', 'price'] // <-- It can be only values
    ];
     
    //Here you specify the export structure
    const specification = {
        kind: { // <- the key should match the actual data key
            displayName: 'نوع قلم', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            
            width: 60 // <- width in pixels
        },
        radif: { // <- the key should match the actual data key
            displayName: 'اعلاميه قيمت شناسه(رديف)', // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            
            width: 40 // <- width in pixels
        },
        saleKind: { // <- the key should match the actual data key
            displayName: "اقلام اعلاميه قيمت كد نوع فروش", // <- Here you specify the column header
            headerStyle: styles.headerDark, // <- Header style
            
            width: 30 // <- width in pixels
        },
        code: {
            displayName: 'اقلام اعلاميه قيمت كد كالا/خدمت',
            headerStyle: styles.headerDark,
            
            width: 90 // <- width in chars (when the number is passed as string)
        },
        unit:{
            displayName: 'اقلام اعلاميه قيمت ارز1',
            headerStyle: styles.headerDark,
            width: 90
        },
        price:{
            displayName: 'اقلام اعلاميه قيمت في',
            headerStyle: styles.headerDark,
            width: 90,
            cellStyle: styles.cellPink
        },
         field01:{
            displayName: 'اقلام اعلاميه قيمت درصد اضافات',
            headerStyle: styles.headerDark,
            width: 90
        },
         field02:{
            displayName: 'اقلام اعلاميه قيمت امكان تغيير في در فاكتور',
            headerStyle: styles.headerDark,
            width: 90
        },
         field03:{
            displayName: 'اقلام اعلاميه قيمت امكان تغيير تخفيف در فاكتور',
            headerStyle: styles.headerDark,
            width: 90
        },
         field04:{
            displayName: 'اقلام اعلاميه قيمت گروه مشتري',
            headerStyle: styles.headerDark,
            width: 90
        },
         field05:{
            displayName: 'اقلام اعلاميه قيمت رديابي',
            headerStyle: styles.headerDark,
            width: 90
        },
         field06:{
            displayName: 'اقلام اعلاميه قيمت درصد افزايش قيمت در فاكتور',
            headerStyle: styles.headerDark,
            width: 90
        },
         field07:{
            displayName: 'اقلام اعلاميه قيمت درصد كاهش قيمت در فاكتور',
            headerStyle: styles.headerDark,
            width: 90
        }
    }
    
     
    const merges = [
      //{ start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
      //{ start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
      //{ start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
    ]
     
    const exportExcelApi =async(req,res)=>{
      console.log("ExportExcelApi")
        const url = `uploads/export/sepidar${Date.now().toString().slice(-5)}.xlsx`
        
        const rxData = await ManSchema.find({})
        var dataset = rxData.map((item,i)=>(
            {kind:"اعلامیه",radif: i+1, 
            saleKind:"1", code: item.sku, 
            unit:"ریال", price: item.lenzPrice?item.lenzPrice:0, 
            field01: '0', field02: '1', field03: '1', field04: '0',
            field05: '0', field06: '0', field07: '0'}
        ))
        const report = excel.buildExport(
        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
            {
            name: 'Report', // <- Specify sheet name (optional)
            //heading: heading, // <- Raw heading array (optional)
            merges: merges, // <- Merge cell ranges
            specification: specification, // <- Report specification
            data: dataset // <-- Report data
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
        return res.send({url:url,status:"success"});
    }
    module.exports = exportExcelApi;