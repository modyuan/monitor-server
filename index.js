const http = require('http');
const fs = require('fs');

var queue= [];

class segTs {
    constructor(data, index) {
        this.data = data;  // must be Buffer not String.
        this.index = index;
    }
}
function make_m3u8(){
    if(queue.length == 0) return '';
    let first = queue[0].index;
    let last = queue[queue.length-1].index;

    let out = '#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:1\n#EXT-X-ALLOW-CACHE:YES\n';
    out +='#EXT-X-MEDIA-SEQUENCE:'+first+'\n';

    for(let i=first;i<=last;i++){
        out+= '#EXTINF:1.0,\n/video/'+i+'.ts\n';
    }
    return out;

}

var indexPage = fs.readFileSync('static/index.html','utf8');
var indexJs   = fs.readFileSync('static/video.min.js','utf8');
var indexCss  = fs.readFileSync('static/video-js.min.css','utf8');

setInterval(()=>{
    if(queue.length>4){
        while(queue.length>4){
            queue.shift();
        }
    }
},2000);


var server = http.createServer((request,response)=>{
    let body = Buffer.alloc(0);
    request.on('data',(chunk) => { 
        body = Buffer.concat([body,chunk]);
    });
    request.on('end',()=>{
        if(request.url.indexOf("/video/")==0){
            if(request.method == 'POST'){
                //upload
                let r = request.url.match(/\d+/);
                if(r.length == 0) {
                    // invalid url, so ignore it. 
                    response.writeHead(400);
                    response.end();
                    console.log('invalide request: '+request.url);
                    return; 
                }else{
                    let index = parseInt(r[0]);
                    queue.push(new segTs(body,index));
                    response.writeHead(200);
                    response.end();
                    console.log("Upload: "+index);
                }
            }else if(request.method == 'GET'){
                let r = request.url.match(/\d+/);
                if(r.length == 0) {
                    response.writeHead(404);
                    response.end();
                    console.log('invalide request: '+request.url);
                    return;
                }else{
                    index = parseInt(r[0]);
                    let item = queue.find(ele=>ele.index == index);
                    if(item){
                        response.setHeader('Content-Type','video/mp2t');
                        response.setHeader('Server','Simple NodeJS Server');
                        response.setHeader('Content-Length',String(item.data.length));
                        response.writeHead(200);
                        response.end(item.data);
                        console.log("Download: "+index);
                    }else{
                        //not found
                        response.writeHead(404);
                        response.end();
                        console.log('invalide request: '+request.url);
                    }
                    

                }
            }
            
        }else if(request.url == '/'){
            //index request
            response.setHeader('Content-Type','text/html');
            response.setHeader('Server','Simple NodeJS Server');
            response.writeHead(200);
            response.end(indexPage);
            console.log("index!");
        }else if(request.url == '/list.m3u8'){
            //m3u8
            let ml = make_m3u8();
            response.setHeader('Content-Type','application/x-mpegurl');
            response.setHeader('Server','Simple NodeJS Server');
            response.writeHead(200);
            response.end(ml);
            console.log("m3u8!");
        }else if(request.url == "/video.min.js"){
            response.setHeader('Content-Type','text/javascript');
            response.setHeader('Server','Simple NodeJS Server');
            response.writeHead(200);
            response.end(indexJs);
        }else if(request.url == '/video-js.min.css'){
            response.setHeader('Content-Type','text/css');
            response.setHeader('Server','Simple NodeJS Server');
            response.writeHead(200);
            response.end(indexCss);
        }

    });

});

server.listen(8000);
