//import http module that has functions which will help to create server
const http = require('http');

//fs module helps to manipulate files and data witin files
const fs = require('fs');

const _ = require('lodash');

//CREATING A SERVER
//creating a server by calling createServer method
//takes callback function and runs every time when request is sent
//req -> object that come loaded information about request
//res -> object that is used to send respond to a user

 const server = http.createServer((req, res) =>{

    //lodash
    const num = _.random(0,20);
    console.log(num)

    //what send to a browser
    //set header content type 
    res.setHeader('content-Type','text/html');



    //basic routing system
    let path = './views/'; 

    switch(req.url){
        case'/':
           path+='home.html';
           res.statusCode = 200;
           break;
        case '/new':
            path+='newPosts.html';
            res.statusCode = 200;
            break;
        case '/popular':
            path+='popularPosts.html';
            res.statusCode = 200;
            break; 
        case '/login':
            path+='login.html';
            res.statusCode = 200;
            break;
        default: 
           path+='404.html';
           res.statusCode = 404;
           break;

    }

    //sedning a response 
    //read html file via relative link
    fs.readFile(path, (err,data) => {
         if(err){
            console.log(err);
            res.end();
         } else {

            res.end(data);
         }
    }) 
 } );


//helps listen to responses and requests
//3000 -> port number represents specific channel in which specific software should communicate. Helps to seperate information
//localhost -> like a domain name which is used in internet. Loopback ip address. 127.0.0.1. 
//localhost comes back to our own computer and helps to create a server out of our own comp.
//call function -> 
server.listen(3000, 'localhost', () => {
    console.log('listening for request in port 3000')
})
