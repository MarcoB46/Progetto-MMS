// var canvasDimX = 940; // Nota: Da abbassare
var canvasDimX = 5000;
var canvasDimY = 600;

var packetStartX = 0;

var pausa = false;
var functionInitialized = false;

var numStations = 500000;
var dimPacket = 10;
var t_piccolo = 1;
var t_counter = 0;

var mandare = false;

var contFrame = 0;

var numSim = 0;// Numero simulazioni


var slotted = false; // Versione slotted

function canISend(){

  var probabDen = 0;

  if(!slotted) probabDen = ( ( 2 * numStations ) - 1 ) * (dimPacket/t_piccolo);
  else probabDen = numStations;

  // console.log("Provo ad inviare al frame: " + contFrame);
  // console.log("Con probabDen: " + probabDen);

  if( Math.floor( (Math.random() * probabDen) + 1 ) == 1 ){
    // console.log("Ci sono riuscito! **********************************************************");
    return true;
  }
  return false;
}

function colliderDetector(x1, x2){
  // x è la punta in alto a destra del rettangolo
  if( (x1 <= x2) && ( (x2 - x1) < dimPacket ) ){
    // console.log("******************** COLLISIONE ************************");
    // console.log("x1 <= x2 ");
    // console.log("x1: " + x1);
    // console.log("x2: " + x2);
    return true;
  }
  else if( (x2 <= x1) && ( (x1 - x2) < dimPacket ) ){
    // console.log("***************** COLLISIONE ***************************");
    // console.log("x2 <= x1 ");
    // console.log("x2: " + x2);
    // console.log("x1: " + x1);
    return true;
  }

  return false;
}


function PacketObj(mittente){
  this.mittente = mittente,

  this.x = 0,

  this.collided = false,
  this.checked = false,

  this.updateX = function(){
    this.x++;
  }
}


function CondivisoObj(){
  this.packets = [],
  this.dimCorsia = (3*dimPacket),

  this.numCollisionTot = 0,
  this.numPacketsTot = 0,

  this.updatePackets = function(){
    for(var i=0; i<this.packets.length; i++){
      while( (this.packets[i].x) > this.dimCorsia ){
        this.packets.splice(0, 1);

        if(this.packets.length == 0) break;
      }
      if(this.packets.length == 0) break;

      // Non più necessario poiché condiviso.packets ha il riferimento
      //this.packets[i].updateX();
    }
  },

  this.checkCollision = function(){
    for(var i=0; i<this.packets.length; i++){

      if(!this.packets[i].checked){
        for(var e=0; e<this.packets.length; e++){
          if(i != e){
            if(colliderDetector(this.packets[i].x, this.packets[e].x)){
              this.packets[i].checked = true;
              this.packets[i].collided = true;

              this.numPacketsTot++;
              this.numCollisionTot++;

              stations[this.packets[i].mittente].numPacketsTot++;
              stations[this.packets[i].mittente].hasCollided();

              break;
            }
          }
        }
      }


      if(!this.packets[i].checked){
        // DA CONTROLLARE
        // Lasciare = nell'if se prima si fa l'updatePackets poi l'addPackets
        if( (this.packets[i].x > dimPacket) ){
          this.packets[i].checked = true;

          this.numPacketsTot++;
          stations[this.packets[i].mittente].numPacketsTot++;
        }
      }

    }
  }
}

function StationObj(id){
  this.id = id,

  this.packets = [],

  this.dimCorsia = (3*dimPacket),

  this.isTransmitting = false,

  this.numCollisionTot = 0,
  this.numPacketsTot = 0,

  this.hasCollided = function(){
    this.numCollisionTot++;
  },

  this.addPacket = function(){
    if( !this.isTransmitting && canISend() ){
      // console.log(contFrame);
      var packet = new PacketObj(this.id);
      this.packets.push(packet);
      condiviso.packets.push(packet);

      this.isTransmitting = true;
    }

  },

  this.updatePackets = function(){
    for(var i=0; i<this.packets.length; i++){
      while( (this.packets[i].x) > this.dimCorsia ){
        this.packets.splice(0, 1);

        if(this.packets.length == 0) break;
      }
      if(this.packets.length == 0) break;

      this.packets[i].updateX();

      // DA PROVARE CON E SENZA =. DEFAULT (=)
      // Lasciare = nell'if se prima si fa l'updatePackets poi l'addPackets
      if(this.packets[i].x > dimPacket){
        this.isTransmitting = false;
      }
      else{ // L'ultimo pacco se in transmissione lo rimette a true
        this.isTransmitting = true;
      }
    }
  }
}


$( document ).ready(function(){

  // ------------------- SWITCH PURO/SLOTTED -------------------------
  $('#modSwitch').on('switchChange.bootstrapSwitch', function(event, state) {
    console.log("//////////////////////// MODALITA' CAMBIATA!!!! //////////////////////////// ");
    // True -> Puro - False -> Slotted
    if(state){
      dimPacket = 10;
      slotted = false;
      numSim = 0;
    }
    else{
      dimPacket = 1;
      t_piccolo = 1;
      slotted = true;
      numSim = 0;
    }
    resetCanvas();
  });

  // ----------------------------------------------------


  // ------------------- PAUSA -------------------------
  var pausaBot = document.getElementById("pausaBtn");

  pausaBot.addEventListener("click", function(e){
    pausa = !pausa;
    if (pausaBot.innerHTML == '<span class="glyphicon glyphicon-pause" aria-hidden="true"> </span> Pausa') {
      pausaBot.innerHTML = "<span class='glyphicon glyphicon-play' aria-hidden='true'> </span> Riprendi";
    }
    else{
      pausaBot.innerHTML = "<span class='glyphicon glyphicon-pause' aria-hidden='true'> </span> Pausa";
    }
  });

  // ----------------------------------------------------


  // ------------------- RESET --------------------------

  var resetBot = document.getElementById("resetBtn");
  resetBot.addEventListener("click", resetCanvas);

  // ----------------------------------------------------



  // -------------------  DISEGNO -----------------------

  var data = [{
    x: [0],
    y: [0]
  }];


  var funzioneDiv = document.getElementById('funzione');

  var layout = {
    title: 'Throughput',
    yaxis: {
      range : [0,100]
    }
  };

  Plotly.plot( funzioneDiv, data, layout, { displayModeBar: false } );

  functionInitialized = true;

  // -----------------------------------------------------

})

var resetCanvas = function(){

  pausa = true;

  condiviso = new CondivisoObj();
  stations = [];

  for (var i = 0; i < numStations; i++) {
    stations.push(new StationObj(i));
  }

  contFrame = 0;

  // ------------------------ Pulisci GRAFICO ---------------------------
  var data = [{
    x: [0],
    y: [0]
  }];

  var funzioneDiv = document.getElementById('funzione');

  funzioneDiv.data = data;

  Plotly.redraw(funzioneDiv);



  document.getElementById("pausaBtn").innerHTML = '<span class="glyphicon glyphicon-pause" aria-hidden="true"> </span> Pausa';

  pausa = false;

};


var condiviso = new CondivisoObj();
var stations = [];


function setup(){
  var canvas = createCanvas(canvasDimX, canvasDimY);

  canvas.parent('sketch');

  for (var i = 0; i < numStations; i++) {
    stations.push(new StationObj(i));
  }

  // frameRate(1);

}


function draw() {

  if(!pausa){

    contFrame++;

    if( t_counter < (t_piccolo - 1) ){
      t_counter++;
    }
    else{
      mandare = true;
      t_counter = 0;
    }


    for(var i=0; i<numStations; i++){
      if(mandare){
        stations[i].addPacket();
      }
      //stations[i].updatePackets();
    }
    for(var i=0; i<numStations; i++){
      stations[i].updatePackets();
    }

    if(mandare){
      mandare = false;
    }

    condiviso.updatePackets();
    condiviso.checkCollision();


    // PROVA CON DIMPACKET-1
    var toIns = `
        <tr>
          <td>`+ numStations +`</td>
          <td>`+ (contFrame) +`</td>
          <td>`+ (condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket +`</td>
          <td>`+ (contFrame - ((condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket) ) +`</td>
          <td>`+ ( (((condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket) / contFrame ) * 100 ).toFixed(2) +` % </td>
        </tr>
    `;

    $("#tbodyStats").html(toIns);



    // --------------------------------------------- DISEGNO GRAFICO ---------------------------------------------------

    if( functionInitialized && (contFrame % 5 == 0) ){ // Altrimenti può provare a modificare il grafico della funzione prima di averlo inizializzato

      var funzioneDiv = document.getElementById('funzione');

      funzioneDiv.data[0].x.push( contFrame );
      funzioneDiv.data[0].y.push( ( (((condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket) / contFrame ) * 100 ).toFixed(2) );


      Plotly.redraw(funzioneDiv);

    }


    // -------------------------------------------------------- Running simulazioni --------------------------------------------------------

    if( contFrame%100 == 0 ){
      console.log("**************************************** Run numero: " + numSim + " ******************************************** ");
      console.log("Checkpoint a " + contFrame + " Frame");
      console.log("Numero frame accettati: " + (condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket );
      console.log("Numero frame rifiutati: " + (contFrame - ((condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket) ) );
      console.log("% Successo: " + ( (((condiviso.numPacketsTot - condiviso.numCollisionTot) * dimPacket) / contFrame ) * 100 ).toFixed(2));
    }
    if( contFrame%10000 == 0 ){
       numSim++;
       resetCanvas();
    }
    if( numSim == 10 ){
      if(slotted) remove();
      else{
        // Passa alla versione slotted
        $('#modSwitch').bootstrapSwitch('state', false, false);
      }
    }
  }

}
