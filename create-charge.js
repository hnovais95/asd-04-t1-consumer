const EfiPay = require('sdk-node-apis-efi')
const options = require('./credentials')

function createCharge(items) {
   return new Promise(async (resolve, reject) => {
      try {
         let body = {
            items: items.map((item) => ({
               name: item.name,
               value: parseInt(item.value, 10),
               amount: parseInt(item.amount, 10)
             }))
         }
      
         const efipay = new EfiPay(options)
         response = efipay.createCharge({}, body)
         
         console.log(response)
         resolve(response)
      } catch (error) {
         console.log(error)
         reject(error)
      }
   });
}

module.exports = createCharge;