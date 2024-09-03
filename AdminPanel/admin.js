const AdminBro = require('admin-bro');
const uploadFeature = require('@admin-bro/upload')
const mongooseAdmin = require('@admin-bro/mongoose');

const User = require('../model/user');
const Post = require('../model/products/Post');
const Category = require('../model/products/category');
const Product = require('../model/products/Product');
const Slider = require('../model/slider');

AdminBro.registerAdapter(mongooseAdmin);
const{
    after: uploadAfterHook,
    before: uploadBeforeHook,
} = require('./components/photo-hook.js');
const services = require('../model/services');
const brands = require('../model/brands/brand');
const ManufactureStateSchema= require('../model/brands/manufacture')
const brandSlider = require('../model/brands/brandsSlider');
const brandsBanner = require('../model/brands/brandsBanner');
const orders = require('../model/Order/orders');
const job = require('../model/job');
const menu = require('../model/menu');
const color = require('../model/products/color');
const mirror = require('../model/products/mirror');
const transferMethod = require('../model/products/transferMethod');
const paymentMethod = require('../model/products/paymentMethod');
const help = require('../model/help');
const manufacture = require('../model/Order/manufacture');
const param = require('../model/Params/param');
const customerSchema=require('../model/customers')
const cover = require('../model/products/cover');
const pages = require('../model/pages');
const mgmInfo = require('../model/mgmInfo');
const Offers = require('../model/Order/Offers');
const sepidarstock = require('../model/Order/sepidarstock');
const contentParent = {
    name:'content',
    icon:'eye' 
}
const userParent = {
    name:'User',
    icon:'eye'
}
const brandParent = {
  name:'Brand',
  icon:'book'
}
const parameterParent = {
  name:'Parameters',
  icon:'book'
}
const orderParent = {
  name:'Order',
  icon:'book'
}
const AdminBroOptions = {
    resources:[
    {resource: services, options: { parent: contentParent } },
    {resource: job, options: { parent: contentParent } },
    {resource: Offers, options: { parent: contentParent } },
    {resource: mgmInfo, options: { parent: contentParent } },
    {resource: User, options: { parent: contentParent } },
    
    {resource: menu, options: { parent: contentParent ,
          listProperties: ['title', 'uploadImage','url'],
          properties: {
            uploadImage:{
                components:{
                    edit:AdminBro.bundle('./components/upload-image.tsx'),
                    list:AdminBro.bundle('./components/upload-list.tsx')
                }
            }
        },
        actions:{
          new:{
              after:async(response,request,context)=>{
                    return uploadAfterHook(response,request,context)
              },
              before:async(request,context)=>{
                  return uploadBeforeHook(request,context)
              }
          }
      }
    }},
    
    {resource: transferMethod, options: { parent: parameterParent } },
    {resource: paymentMethod, options: { parent: parameterParent } },
    {resource: cover, options: { parent: parameterParent } },
    {resource: param, options: { parent: parameterParent } },
    {resource: orders, options: { parent: userParent } },
    
    {resource: help, options: { parent: parameterParent ,
      properties: {
          uploadImage:{
              components:{
                  edit:AdminBro.bundle('./components/upload-image.tsx'),
                  list:AdminBro.bundle('./components/upload-list.tsx')
              }
          }
      },
      actions:{
          new:{
              after:async(response,request,context)=>{
                  return uploadAfterHook(response,request,context)
              },
              before:async(request,context)=>{
                  return uploadBeforeHook(request,context)
              }
          },
          edit:{
            after:async(response,request,context)=>{
                return uploadAfterHook(response,request,context)
            },
            before:async(request,context)=>{
                return uploadBeforeHook(request,context)
            }
        }
        }
      }
    },
    {resource: brands, options: { parent: brandParent ,
          listProperties: ['title', 'uploadImage'],
        properties: {
          uploadImage:{
              components:{
                  edit:AdminBro.bundle('./components/upload-image.tsx'),
                  list:AdminBro.bundle('./components/upload-list.tsx')
              }
          },
      },
      actions:{
        new:{
            after:async(response,request,context)=>{
                 return uploadAfterHook(response,request,context)
            },
            before:async(request,context)=>{
                return uploadBeforeHook(request,context)
            }
          }
        }
    }},
    {resource: brandSlider, options: { parent: brandParent ,
        listProperties: ['title', 'uploadImage'],
      properties: {
        uploadImage:{
            components:{
                edit:AdminBro.bundle('./components/upload-image.tsx'),
                list:AdminBro.bundle('./components/upload-list.tsx')
            }
        },
    },
    actions:{
      new:{
          after:async(response,request,context)=>{
               return uploadAfterHook(response,request,context)
          },
          before:async(request,context)=>{
              return uploadBeforeHook(request,context)
          }
        }
      }
    }},
    {resource: manufacture, options: { parent: contentParent } },
    {resource: ManufactureStateSchema, options: { parent: brandParent } },
    {resource: sepidarstock, options: { parent: contentParent } },
    {resource: customerSchema, options: { parent: userParent } },


    {resource: brandsBanner, options: { parent: brandParent ,
      listProperties: ['title', 'uploadImage'],
    properties: {
      uploadImage:{
          components:{
              edit:AdminBro.bundle('./components/upload-image.tsx'),
              list:AdminBro.bundle('./components/upload-list.tsx')
          }
      },
  },
  actions:{
    new:{
        after:async(response,request,context)=>{
             return uploadAfterHook(response,request,context)
        },
        before:async(request,context)=>{
            return uploadBeforeHook(request,context)
        }
      }
    }
  } }
    ]
}
const adminBro = new AdminBro(AdminBroOptions);


module.exports = adminBro;