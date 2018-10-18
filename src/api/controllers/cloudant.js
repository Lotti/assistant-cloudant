// 5760b7c0bb603c8b44a6e9430e32e206
const log4js = require('log4js');

const Cloudant = require('@cloudant/cloudant');
const cloudant = new Cloudant({url: process.env.CLOUDANT_URL, plugins: 'promises'});

const db = cloudant.use(process.env.CLOUDANT_DB);

const log = log4js.getLogger('cloudant');

module.exports.get = (req, res) => {
    const params = req.swagger.params;
    const id = params.id.value;

    db.get(id).then((doc) => {
        log.info('response: %j', doc);
        res.json(doc);
    }).catch((error) => {
        log.error('error:', error);
        res.json({message: 'An error has occurred while retrieving document from cloudant', error: error});
    });
};

module.exports.put = (req, res) => {
    const params = req.swagger.params;
    log.fatal(params);
    const body = params.body.value;
    log.fatal(body);

    db.insert(body).then((doc) => {
        log.info('response: %j', doc);
        res.json({...body, _rev: doc.rev});
    }).catch((error) => {
        log.error('error:', error);
        res.json({message: 'An error has occurred while retrieving document from cloudant', error: error});
    });
};
