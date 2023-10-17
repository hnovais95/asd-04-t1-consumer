require('dotenv').config();

module.exports = {
	sandbox: true,
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	certificate: 'keys/homologacao-288073-consumer-certificate.p12',
}