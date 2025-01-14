const rateLimit = require('express-rate-limit');

//Configure rate limiting
const apiLimiter = rateLimit({
    //15 mins
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: "Too many requests, please try again later",
    handler: (req, res, next, options) => {
        console.warn(`Blocked IP ${req.ip}`);
        res.status(429).json({error : 'Too many requests. You have been temporary blocked'});
    }
});

module.exports = apiLimiter;