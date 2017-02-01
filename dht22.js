const express = require('express');
const rpiDhtSensor = require('rpi-dht-sensor');
const wpi = require('wiring-pi');

const app = express();

const pin = 29;

wpi.pinMode(pin,wpi.OUTPUT);

const value = 0;

const dht = new rpiDhtSensor.DHT22(4);

function read() {
    const readout = dht.read();

    console.log('Temperature: '+readout.Temperature.toFixed(2) +'ºC'+'Humidity: '+ readout.humidity.toFixed(2))+'%');

    setTimeout(read,2000);
}

read();

app.listen(3000,()=>{
  console.log('Server listening at port 3000');
});
