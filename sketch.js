const canvasDimX = 940;
const canvasDimY = 600;

const packetStartX = 120;

var pausa = false;
var numStations = 6;

var dimPacket = 50;

var t_piccolo = 10; // intervallo di tempo
var t_counter = 0; // contatore t
var mandare = false; // condizione per mandare in intervalli di tempo
var velocita = 4; // velocita di movimento --> Se si cambia bisogna cambiarla anche nel default dello slider

var contFrame = 0;

function CanISend(){
  this.probabNum = 30; // --> Se si cambia bisogna cambiarla anche nel default dello slider
  this.probabDen = 100*numStations; // 30% iniziale cumulativo

  this.result = function(){
    if(Math.floor(Math.random() * this.probabDen) < this.probabNum)
      return true;
    else
      return false;
  }
}

var canISend = new CanISend(); // Singleton


function colliderDetector(x1, dimX1, x2, dimX2){
  if( (x1 <= x2) && (x1 + dimX1 > x2) ){
    return true;
  }
  else if( (x2 <= x1) && (x2 + dimX2 > x1) ){
    return true;
  }

  return false;
}

function PacketObj(mittente, destinatario, colore, startY){
  this.mittente = mittente, //id della stazione mittente
  this.destinatario = destinatario, //id della stazione destinataria

  this.dimX = 0,
  this.dimY = 30,

  this.x = packetStartX,
  this.y = 27 + startY,

  this.maxDimX = dimPacket,

  this.collided = false,

  this.stroke = "black",
  this.strokeWeight = 1,

  this.show = function(){
    fill(colore);

    stroke(this.stroke);
    strokeWeight(this.strokeWeight);

    rect(this.x, this.y, this.dimX, this.dimY);

    stroke("black");
    strokeWeight(1);
  },

  this.updateX = function(toSum){
    this.x = this.x + toSum;
  }
}


function StationObj (id, nome, color, multiplier){
  this.id = id,
  this.nome = nome,
  this.packets = [],

  this.dimX = canvasDimX - 20,
  this.dimY = 80,

  this.x = 0,
  this.y = (multiplier-1)*this.dimY,

  this.isTransmetting = false,

  this.countdown = 0,
  this.numCollision = 0,

  this.numCollisionTot = 0,
  this.numPacketsTot = 0,

  this.color = color, // Colore dei pacchetti trasmessi
  this.textColor = "black",

  this.hasCollided = function(){
    this.numCollision++;
    this.countdown = ( Math.floor(Math.random() * 60) + 60) * this.numCollision;

    this.numCollisionTot++;
  }

  this.addPacket = function(destinatario){
    if( this.countdown > 0 ){

      this.countdown -= velocita;
    }
    else if( !this.isTransmetting && canISend.result() ){
      var packet = new PacketObj(this.id, destinatario, color, this.y);
      this.packets.push(packet);

      var packetCondiviso = new PacketObj(this.id, destinatario, color, condiviso.y);
      condiviso.packets.push(packetCondiviso); // Inoltra i pacchetti al condiviso

      this.isTransmetting = true;
    }
  },

  this.updatePackets = function(){
    for(var i=0; i<this.packets.length; i++){

      while( (this.packets[i].x + velocita) > this.dimX){

        this.packets.splice(0, 1);

        if(this.packets.length == 0) break;
      }
      if(this.packets.length == 0) break;

      if(this.packets[i].dimX < this.packets[i].maxDimX){
        this.packets[i].dimX += velocita;
      }
      else if(this.packets[i].dimX >= this.packets[i].maxDimX){
        this.packets[i].dimX = this.packets[i].maxDimX;

        if(this.packets[i].x == packetStartX){
          this.isTransmetting = false;
        }

        this.packets[i].updateX(velocita);
      }

      this.packets[i].show();

    }
  },

  this.show = function(){
    textSize(25);
    fill(this.textColor);

    text(this.nome, this.x, this.y+50),

    line(this.x, this.y+(0.8*this.dimY), this.x+this.dimX, this.y+(0.8*this.dimY));

    beginShape(TRIANGLES);
      vertex(this.x+this.dimX + 10, this.y+(0.8*this.dimY));
      vertex(this.x+this.dimX, this.y+(0.8*this.dimY) + 5);
      vertex(this.x+this.dimX, this.y+(0.8*this.dimY) - 5);
    endShape();
  }
}

var arrColors = [
  "rgba(56, 107, 188, 0.2)",
  "rgba(56, 188, 63, 0.2)",
  "rgba(183, 67, 49, 0.2)",
  "rgba(219, 209, 19, 0.2)",
  "rgba(209, 19, 219, 0.2)",
  "rgba(255, 0, 0, 0.2)"
];

var stations = [];
stations.push(new StationObj(0, "Stazione 1", "rgba(56, 107, 188, 0.2)", 1));
stations.push(new StationObj(1, "Stazione 2", "rgba(56, 188, 63, 0.2)", 2));
stations.push(new StationObj(2, "Stazione 3", "rgba(183, 67, 49, 0.2)", 3));
stations.push(new StationObj(3, "Stazione 4", "rgba(219, 209, 19, 0.2)", 4));
stations.push(new StationObj(4, "Stazione 5", "rgba(209, 19, 219, 0.2)", 5));
stations.push(new StationObj(5, "Stazione 6", "rgba(255, 0, 0, 0.2)", 6));



$( document ).ready(function(){

  var slider = new Slider("#ex1");
  slider.on("change", function(sliderValue) {
    document.getElementById("ex1SliderVal").textContent = sliderValue.newValue;

    resetCanvas();
  });

  var slider = new Slider("#ex2");
  slider.on("change", function(sliderValue) {
    document.getElementById("ex2SliderVal").textContent = sliderValue.newValue;
    canISend.probabNum = sliderValue.newValue;
  });

  var slider = new Slider("#ex3");
  slider.on("change", function(sliderValue) {
    document.getElementById("ex3SliderVal").textContent = sliderValue.newValue;
    velocita = sliderValue.newValue;
  });

  $('#modSwitch').on('switchChange.bootstrapSwitch', function(event, state) {

    // True -> Puro
    // False -> Slotted
    if(state) t_piccolo = 10;
    else t_piccolo = dimPacket;

    resetCanvas();

  });




  // ------------------- PAUSA -------------------------
  var pausaBot = document.getElementById("pausaBtn");
  pausaBot.addEventListener("click", function(e){
    pausa =! pausa;

    if (pausaBot.innerHTML == '<span class="glyphicon glyphicon-pause" aria-hidden="true"> </span> Pausa') {
      pausaBot.innerHTML = "<span class='glyphicon glyphicon-play' aria-hidden='true'> </span> Riprendi";
    }
    else{
      pausaBot.innerHTML = "<span class='glyphicon glyphicon-pause' aria-hidden='true'> </span> Pausa";
    }
   // ----------------------------------------------------

  });

  var resetBot = document.getElementById("resetBtn");
  resetBot.addEventListener("click", resetCanvas);


  // -------------------  DISEGNO -----------------------

  var data = [{
    x: [0],
    y: [0]
  }];


  var funzioneDiv = document.getElementById('funzione');

  var layout = {
    title: 'Throughput',
    width: 630,
    xaxis: {
      title: 'Frame (1 Sec = 60 Frame)'
    },
    yaxis: {
      title: '% Throughput',
      range: [-5,105]
    }
  };

  Plotly.plot( funzioneDiv, data, layout, { displayModeBar: false } );


});

// Variabili del Grafico
var data = [{
  x: [0],
  y: [0]
}];


var resetCanvas = function(){

  pausa = true;

  stations = [];
  condiviso.packets = [];

  numStations = document.getElementById("ex1SliderVal").textContent;

  for( var i =0 ; i<numStations; i++){
    stations.push(new StationObj(i, "Stazione "+(i+1).toString(), arrColors[i], i+1));
  }

  // Pulisci il Grafico
  data = [{
    x: [0],
    y: [0]
  }];

  var funzioneDiv = document.getElementById('funzione');

  funzioneDiv.data = data;

  Plotly.redraw(funzioneDiv);

  totPacketsSend = 0;
  totCollisions = 0;

  contFrame = 0;


  document.getElementById("pausaBtn").innerHTML = '<span class="glyphicon glyphicon-pause" aria-hidden="true"> </span> Pausa';

  pausa = false;

};


var condiviso = new StationObj(6, "Condiviso", "black", 7);
condiviso.textColor = "red";
delete condiviso.addPacket;

condiviso.showCollision = function(){

  for(var i=0; i<this.packets.length; i++){
    if(!this.packets[i].collided){

      for(var e=0; e<this.packets.length; e++){
        if(i != e){
          if(colliderDetector(this.packets[i].x, this.packets[i].dimX, this.packets[e].x, this.packets[e].dimX)){
            this.packets[i].stroke = "red";
            this.packets[i].strokeWeight = 2;

            this.packets[i].collided = true;

            stations[this.packets[i].mittente].numPacketsTot++;
            stations[this.packets[i].mittente].hasCollided();
            break;
          }
        }
      }

    }

    if(!this.packets[i].collided){
      if( (this.packets[i].dimX >= this.packets[i].maxDimX) && (this.packets[i].x == packetStartX) ){
        stations[this.packets[i].mittente].numPacketsTot++;
        stations[this.packets[i].mittente].numCollision = 0;
      }
    }
  }

}


var data = [{
  x: [0],
  y: [0]
}];


function setup(){

  var canvas = createCanvas(canvasDimX, canvasDimY);

  canvas.parent('sketch');

  background(255, 255, 255);


  frameRate(60);
}

function draw(){

  if(!pausa){

    contFrame += velocita;

    background(255, 255, 255);

    var len = stations.length;
    var receiverIndex = -1;

    condiviso.show();
    condiviso.showCollision();
    condiviso.updatePackets();

    if(t_counter < Math.ceil(t_piccolo/velocita)){
      t_counter++;
    }else {
      mandare = true;
      t_counter = 0;
    }

    var stationsLen = stations.length;
    for(var i=0; i<stationsLen; i++){
      stations[i].show();
      stations[i].updatePackets();

      if (mandare) {
        do{
          receiverIndex = Math.floor(Math.random() * len);
        } while(i == receiverIndex);

        stations[i].addPacket(stations[receiverIndex].id);
      }
    }

    var toIns = "";
    var totPacketsSend = 0;
    var totCollisions = 0;

    for(var i=0; i<stationsLen; i++){
      totPacketsSend += stations[i].numPacketsTot;
      totCollisions += stations[i].numCollisionTot;

      toIns = toIns + `
        <tr>
          <td>`+stations[i].nome+`</td>
          <td>`+stations[i].numPacketsTot+`</td>
          <td>`+stations[i].numCollisionTot+`</td>
          <td>`+ (stations[i].numPacketsTot == 0 ? 0 :
                  ( ((stations[i].numPacketsTot - stations[i].numCollisionTot) * dimPacket) / contFrame * 100).toFixed(2) )
          +` % </td>
        </tr>
      `;

    }

    toIns = toIns + `
      <tr>
        <td style="color:red;"><b>Condiviso</b></td>
        <td style="color:red;">`+totPacketsSend+`</td>
        <td style="color:red;">`+totCollisions+`</td>
        <td style="color:red;">`+ ( ((totPacketsSend - totCollisions) * dimPacket) / contFrame * 100).toFixed(2) +` % </td>
      </tr>
    `;



    $("#tbodyStats").html(toIns);



    if (mandare) {
      mandare = false;


      // -------------------------------------------------- DISEGNO GRAFICO ------------------------------------------------------

      var funzioneDiv = document.getElementById('funzione');

      funzioneDiv.data[0].x.push( contFrame );
      funzioneDiv.data[0].y.push( (((totPacketsSend - totCollisions) * dimPacket) / contFrame * 100).toFixed(2) );


      var update = {
          'xaxis.range': [
            (funzioneDiv.data[0].x[funzioneDiv.data[0].x.length-1]-500 < 0 ? 0 : funzioneDiv.data[0].x[funzioneDiv.data[0].x.length-1]-500),
            funzioneDiv.data[0].x[funzioneDiv.data[0].x.length-1]
          ]
      };
      Plotly.relayout(funzioneDiv, update);
      Plotly.redraw(funzioneDiv);
    }


  }

}
