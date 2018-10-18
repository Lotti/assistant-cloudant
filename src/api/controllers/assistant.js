const log4js = require('log4js');
const log = log4js.getLogger('assistant');

const AssistantV1 = require('watson-developer-cloud/assistant/v1');
const assistant = new AssistantV1({
    version: '2018-09-20',
    username: process.env.ASSISTANT_USERNAME,
    password: process.env.ASSISTANT_PASSWORD,
    url: process.env.ASSISTANT_URL,
});

module.exports.message = (req, res) => {
    const params = req.swagger.params;
    const body = params.body.value;
    assistant.message({
        workspace_id: process.env.ASSISTANT_WORKSPACE,
        input: {text: body.text}
    }, (err, response) => {
        if (err) {
            log.error('error:', err);
            res.json({message: 'An error occurred while contacting Watson Assistant service', error: err});
        } else {
            log.info('response: %j', response);
            res.json(response);
        }
    });
};
