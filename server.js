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
                const filename = payload.filename
                const batch = payload.batch

                const items = await processFile(filename);
                const chargePdfUrl = await createCharge(items);

                const result = {
                    batch: batch,
                    url: chargePdfUrl
                }

                const string = JSON.stringify(result);
                pubChannel.sendToQueue(processedFilesQueue, Buffer.from(string));

                console.log('Arquivo processado com sucesso:', result);
            } else {
                console.log('Consumidor cancelado pelo servidor.');
            }
        } catch (error) {
            console.error(`Erro ao processar arquivo: ${error}`);
        } finally {
            subChannel.ack(msg);
        }
    });

    // TODO: remove this
    const mock = {
        batch: 1,
        filename: `https://trabalhofinalpos.blob.core.windows.net/files/trabalhofinalpos/1698195940022.csv`
    }

    const string = JSON.stringify(mock);
    pubChannel.sendToQueue(filesQueue, Buffer.from(string));
})();

