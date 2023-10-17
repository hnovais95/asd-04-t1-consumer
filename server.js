require('dotenv').config();

const amqplib = require('amqplib');
const processFile = require('./proccess-file');
const createCharge = require('./create-charge');

(async () => {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);

    const filesQueue = process.env.FILES_QUEUE;
    const processedFilesQueue = process.env.PROCESSED_FILES_QUEUE;

    const subChannel = await conn.createChannel();
    const pubChannel = await conn.createChannel();

    await subChannel.assertQueue(filesQueue, {
        arguments: {
            'x-dead-letter-exchange': process.env.DEAD_LETTER_EXCHANGE_NAME
        }
    });

    subChannel.consume(filesQueue, async (msg) => {
        try {
            if (msg !== null) {
                console.log('Mensagem recebida:', msg.content.toString());

                const payload = JSON.parse(msg.content.toString());
                const batch = payload.batch;
                const filename = payload.filename;

                const items = await processFile(batch, filename);
                const charge = await createCharge(items);

                const result = {
                    filename: filename,
                    chargeId: charge.data.charge_id
                }

                const string = JSON.stringify(result);
                pubChannel.sendToQueue(processedFilesQueue, Buffer.from(string));

                subChannel.ack(msg);
                console.log('Arquivo processado com sucesso:', result);
            } else {
                console.log('Consumidor cancelado pelo servidor.');
            }
        } catch (error) {
            console.log(`Erro ao processar arquivo: ${error}`);
        }
    });

    // TODO: remove this
    // const mock = {
    //     batch: 1,
    //     filename: 'b07a6cdf-7c18-4a82-b344-cbf023300d39.csv'
    // }

    // const string = JSON.stringify(mock);
    // pubChannel.sendToQueue(filesQueue, Buffer.from(string));
})();

