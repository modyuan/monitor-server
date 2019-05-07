const http = require('http');
const handler = require('./handler.js');

var server = http.createServer((request,response)=>{
    let body = ''
    request.on('data',chunk => body += chunck);
    request.on('end',()=>{

    });

});

server.listen(8000);
