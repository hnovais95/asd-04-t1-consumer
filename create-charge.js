const EfiPay = require('sdk-node-apis-efi')
const options = require('./credentials')

function createCharge(items) {
   return new Promise(async (resolve, reject) => {
      try {
         const charge = await executeCharge(items)
         const chargeId = charge.data.charge_id

         const chargePdfUrl = await executeDefinePayMethod(chargeId)

         resolve(chargePdfUrl)
      } catch (error) {
         console.error(error)
         reject(error)
      }
   });
}

async function executeCharge(items) {
   const body = {
      items: items.map((item) => ({
         name: item.nome,
         value: parseInt(item.valor, 10),
         amount: parseInt(item.quantidade, 10)
       }))
   }

   const efipay = new EfiPay(options)
   return await efipay.createCharge({}, body)
}

async function executeDefinePayMethod(chargeId) {
   const params = { 
      id: chargeId 
   }

   const body = {
      payment: {
         banking_billet: {
            expire_at: '2023-12-01',
            customer: {
               name: 'Gorbadoc Oldbuck',
               email: 'oldbuck@efipay.com.br',
               cpf: '94271564656',
               birth: '1977-01-15',
               phone_number: '5144916523',
            },
         },
      },
   }

   const efipay = new EfiPay(options)
   const response = await efipay.definePayMethod(params, body)
   const chargePdfUrl = response.data.pdf.charge
   return chargePdfUrl
}

module.exports = createCharge;