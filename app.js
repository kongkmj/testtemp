const express = require('express');
const path = require('path');
const net = require('net');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

require('events').EventEmitter.prototype._maxListeners = 9999999;

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const port =3000;
const tcpPort= 5000;
const tcpPort2 = 4444;

const server = net.createServer((client)=>{
  console.log('Client connection :');
  console.log('   local = %s:%s',client.localAddress,client.localport);
  console.log('   remote = %s:%s',client.remoteAddress,client.remotePort);
  //client.setTimeout(500);
  client.setEncoding('utf8');
  client.on('data',(data)=>{
    var arduinoData =""+data;
    var arduinoArray = arduinoData.split(',');

    console.log("아두이노에서 "+arduinoArray);
    io.emit("arduinoArray",arduinoArray);
    io.emit("arduinoTemp",arduinoArray[0],arduinoArray[1]);
    io.emit("arduinoHumi",arduinoArray[1]);
    io.emit("arduinoGas",(arduinoArray[2]-100)/10);
    io.emit("arduinoFire",arduinoArray[3]);
    console.log('Received data from client on port %d: %s', client.remotePort,data.toString());
    console.log('  Bytes received: '+client.bytesRead);
    //writeData(client,'Sending: '+data.toString());
    console.log('  Bytes sent: '+client.bytesWritten);

  });
  client.on('end',()=>{
    console.log('Client diisconnected');
    server.getConnections((err,count)=>{
      console.log('Remaing Connection: '+ count);
    });
  });
  client.on('error',(err)=>{
    console.log('Socket Error: '+JSON.stringify(err));
  });
  client.on('timeout',()=>{
    console.log('Socket Timed out');
  });
});

const server2 = net.createServer((client)=>{
  console.log('Client connection :');
  console.log('   local = %s:%s',client.localAddress,client.localport);
  console.log('   remote = %s:%s',client.remoteAddress,client.remotePort);
  client.setTimeout(500);
  client.setEncoding('utf8');
  io.on('connection',(socket)=>{
    // 도어락 소켓
    socket.on('door',(doorcnt)=>{
      if(doorcnt==1){
        writeData(client,"1"); // 도어락 OPEN
      }
      else if(doorcnt==2){
        writeData(client,"2"); // 도어락 CLOSE
      }
    });
    // 전등 소켓
    socket.on('light',(lightcnt)=>{
      if(lightcnt==1){
        writeData(client,"3"); // 전등 ON
      }
      else if(lightcnt==2){
        writeData(client,"4"); // 전등 OFF
      }
    });
    // 에어컨 소켓
    socket.on('aircon',(airconcnt)=>{
      if(airconcnt==1){
        writeData(client,"5"); // 에어컨  ON
      }
      else if(airconcnt==2){
        writeData(client,"6"); // 에어컨 OFF
      }
    });
  })
  client.on('data',(data)=>{
    var raspiData =""+data;
    var raspiArray = raspiData.split(',');
    console.log("라즈베리파이에서 "+raspiArray);
    io.emit("raspiArray",raspiArray);
    io.emit("raspiTemp",raspiArray[0]);
    io.emit("raspiHumi",raspiArray[1]);

    console.log('Received data from client on port %d: %s', client.remotePort,data.toString());
    console.log('  Bytes received: '+client.bytesRead);
    //writeData(client,'Sending: '+data.toString());
    console.log('  Bytes sent: '+client.bytesWritten);
  });
  client.on('end',()=>{
    console.log('Client diisconnected');
    server2.getConnections((err,count)=>{
      console.log('Remaing Connection: '+ count);
    });
  });
  client.on('error',(err)=>{
    console.log('Socket Error: '+JSON.stringify(err));
  });
  client.on('timeout',()=>{
    console.log('Socket Timed out');
  });
});

server.listen(tcpPort,()=>{
  console.log('Sever listening: '+JSON.stringify(server.address()));
  server.on('close',()=>{
    console.log('Server Terminated');
  });
  server.on('error',(err)=>{
    console.log('Server Error: '+JSON.stringify(err));
  });
});

server2.listen(tcpPort2,()=>{
  console.log('Sever listening: '+JSON.stringify(server2.address()));
  server2.on('close',()=>{
    console.log('Server Terminated');
  });
  server2.on('error',(err)=>{
    console.log('Server Error: '+JSON.stringify(err));
  });
});

// TCP 쓰기함수
function writeData(socket,data) {
  var success = !socket.write(data);
  if(!success){
    (function(socket,data){
      socket.once('drain',()=>{
        writeData(socket,data);
      });
    })(socket,data);
  }
}


// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/',require('./api'));

io.on('connection',(socket)=>{
  console.log('a user connected!');
  socket.on('chat message',function (msg) {
    //time
    var now = new Date();
    var hour = now.getHours();
    var min = now.getMinutes();
    //var second = now.getSeconds();
    if(hour>=12){
      hour = '오후 '+(hour-12);
    }
    else{
      hour = '오전 '+hour;
    }
    var time = hour+':'+min;
    console.log(time);
    io.emit('chat message',msg,time);
  });
});

http.listen(port,()=>{
  console.log(`Server listening at port 3000`);
});
module.exports = app;
