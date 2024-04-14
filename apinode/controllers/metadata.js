const os = require('os');

exports.getInfo = (req, res, next) => {
    res.set("xapi", "api pour le sport");
    res.set("Content-Type","application/json");
    return res.status(200).json({
        "name": "Hector",
        "date": "06/04/2024"
    });
}

exports.getHealth= (req, res, next) => {
    res.set("xapi", "api pour le sport");
    res.set("Content-Type","application/json");
    return res.status(200).json({
        "status": "server is up" 
    });
}

exports.getStatus = (req, res, next) => {
    res.set("xapi", "api pour le sport");
    res.set("Content-Type","application/json");
    return res.status(200).json({
       "uptime": {
        os: String(os.uptime()) + " seconds",
            process: String(process.uptime()) + " seconds",
       }
    });
}