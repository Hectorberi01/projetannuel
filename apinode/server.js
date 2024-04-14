const http = require('http');
const app = require('./app');


// normaliser le port (conversion string to int)
const normalizePort = val => {
    const port = parseInt(val, 10);

    if (isNaN(port)){
        return val;
    }
    if ((port >= 0) && (port <=65536)){
        return port;
    }
    return false;
};


const errorHandler = error => {
    if (error.syscall !== 'listen'){
        throw error;
    }

    const address = server.address();
    const bind = typeof address === 'string' ?'pipe' + address: 'port: ' + port;

    switch(error.code){
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
          case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
          default:
            throw error;
    }
};

// normalisation du port
const port = normalizePort(process.env.API_PORT || '8088');

// port d'écoute de express
app.set('port', port);

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe' + address : 'port : ' + port;

    console.log('*****************************************');
    console.log('*****************************************');
    console.log('*** Application Programming Interface ***');
    console.log('*** Services listening on ' + bind + " ***");
    console.log('*****************************************');
    console.log('*****************************************');
});

var serveur = server.listen(port);
module.exports = serveur;