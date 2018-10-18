module.exports.validate_token = (_, __, nekot, cb) => {
    // console.log('authOrSecDef', authOrSecDef);
    // console.log('cb', cb);
    if (!nekot) {
        return cb(new Error('missing token'));
    }

    nekot = nekot.toLowerCase();
    if (!nekot.startsWith('bearer')) {
        return cb(new Error('missing bearer prefix in token'));
    }

    nekot = nekot.replace('bearer', '').trim();
    if (nekot === '1234567890') {
        cb();
    } else {
        cb(new Error('access denied!'));
    }
};

module.exports.validate_apikey = (_, __, ___, cb) => {
    /*
    // check header
    const token = req.headers['authorization'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), (err, decoded) => {
            if (err) {
                req.res.status(403).json({
                    status: {
                        statusCode: 50002,
                        isSuccess: false,
                        message: 'Failed to authenticate token.'
                    }
                });
                req.res.end();
                return;
            } else {
                // if everything is good, save to request for use in other routes
                if (!decoded) {
                    req.res.status(403).json({
                        status: {
                            statusCode: 50002,
                            isSuccess: false,
                            message: 'Invalid token'
                        }
                    });
                    req.res.end();
                    return;
                }
                else {
                    req.user = decoded;
                    req.User = function () {
                        return user.findOne({
                            where: req.user.id
                        });
                    };
                    cb();
                    return;
                }
            }
        });

    } else {

        // if there is no token
        // return an error
        req.res.status(403).json({
            status: {
                statusCode: 50002,
                isSuccess: false,
                message: 'access denied!'
            }
        });
        req.res.end();
        return;
    }
    */
    cb();
};
