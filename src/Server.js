const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const log4js = require('log4js');

const SwaggerExpress = require('swagger-express-mw');

const compression = require('compression');
const errorhandler = require('errorhandler');
const express = require('express');

const log = log4js.getLogger('server');

// Create the server

/**
 * Server made with express and swagger. This is a singleton.
 */
class Server {
    /**
     * Server constructor
     */
    constructor() {
        /*
        const options = {
            key: fs.readFileSync('/path/to/key.pem'),
            cert: fs.readFileSync('/path/to/cert.pem'),
        };
        */

        this.port = process.env.PORT || 3000;
        this.indexPage = path.join(process.cwd(), 'public', 'index.html');
        this.app = express();
        this.httpServer = http.createServer(this.app);
        // this.httpsServer = https.createServer(options, this.app);
        this.app.set('port', this.port);
        this.app.use(compression());

        if (process.env.NODE_ENV !== 'production') {
            this.app.use(errorhandler());
        } else {
            this.app.use((err, req, res, next) => {
                const status = err.status || 500;
                if (process.env.NODE_ENV !== 'production') {
                    log.error('Request Error', err);
                    res.status(status).end(err.message);
                } else {
                    res.status(status).end();
                }
            });
        }

        const maxAge = 60 * 60 * 1000; // 1 hour
        this.app.use('/docs', express.static(path.join(process.cwd(), 'public', 'swagger-ui'), {maxAge}));
        this.app.use(express.static(path.join(process.cwd(), 'public'), {maxAge}));

        /**
         * Primary app routes.
         */
        const config = {
            appRoot: __dirname,
            configDir: path.join(process.cwd(), 'swagger-config'),
            swagger: path.join(process.cwd(), 'swagger-api/api.yaml'),
        };

        SwaggerExpress.create(config, (err, swaggerExpress) => {
            if (err) {
                throw err;
            } else {
                swaggerExpress.register(this.app);
                swaggerExpress.runner.on('error', (validationResponse, _, res) => {
                    const l = log4js.getLogger('swagger_error');
                    l.error('%j', validationResponse);
                    res.json(validationResponse);
                });
                swaggerExpress.runner.on('responseValidationError', (validationResponse, _, res) => {
                    const l = log4js.getLogger('resValidationError');
                    l.error('%j', validationResponse);
                    res.json(validationResponse);
                });
            }
        });

        fs.access(this.indexPage, fs.constants.F_OK, (err) => {
            if (err) {
                this.app.get('^/$', (_, res) => {
                    res.writeHead(301, {Location: '/docs'});
                    res.end();
                });
            } else {
                this.app.use((req, res, next) => {
                    if (!req.url.match(/docs|api/)) {
                        res.sendFile(this.indexPage);
                    } else {
                        next();
                    }
                });
            }
        });
    }

    /**
     * Static method to return the same instance
     */
    static INSTANCE() {
        if (!Server.instance) {
            Server.instance = new Server();
        }

        return Server.instance;
    }

    /**
     * Runs the server
     */
    run() {
        this.httpServer.listen(this.port, () => {
            log.info('App is running at http://localhost:%d in %s mode', this.port, this.app.get('env'));
            log.info('Press CTRL-C to stop');
        });
    }

    getHttpServer() {
        return this.httpServer;
    }

    getApp() {
        return this.app;
    }
}

module.exports = Server;
