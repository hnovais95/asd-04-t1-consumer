require('dotenv').config();
const axios = require('axios');
const csvtojson = require('csvtojson');
const fs = require('fs');

function processFile(url) {
   return new Promise(async (resolve, reject) => {
      try {
         const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
         })

         response.data.on('data', chunk => {
            const csvString = chunk.toString('utf-8');
            csvtojson()
               .fromString(csvString)
               .then(json => {
                  resolve(json);
               });
         });
      } catch(error) {
         console.error('Erro na requisição da API:', error.message);
         reject(error);
      }
   });
}

module.exports = processFile;