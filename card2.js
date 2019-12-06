nano

const contractSource = `
contract Card =

  record card = {
     card   : string,
     nombre : string,
     saldo  : int }

  record state = {
    cards : map(string, card) }

  entrypoint init() = { cards = {} }

  stateful entrypoint recarga_inicial( card' : string, nombre' : string, monto : int ) =
    let card = { card = card', nombre = nombre', saldo = monto }
    put(state {cards[card'] = card})

  entrypoint busca_tarjeta(card' : string) : card =
    state.cards[card']

  stateful entrypoint recarga( card' : string, monto : int ) =
    let card = busca_tarjeta( card')
    let nuevoSaldo = card.saldo + monto
    let cardActualizada = state.cards{ [card'].saldo = nuevoSaldo }
    put(state {cards = cardActualizada})

  stateful entrypoint consumo( card' : string, monto : int ) =
    let card = busca_tarjeta( card')
    let nuevoSaldo = card.saldo - monto
    if(nuevoSaldo < 0)
      abort("Saldo insuficiente")
    else
      let cardActualizada = state.cards{ [card'].saldo = nuevoSaldo }
      put(state {cards = cardActualizada})
`;

//Address of the meme voting smart contract on the testnet of the aeternity blockchain
const contractAddress = 'ct_2S6iP3HpxsVYsJAd9tTH1FKdEygjQXehCZZLDp2hosZ7jbQf2T';
//Create variable for client so it can be used in different functions
let card = {};
//Create a new global array for the memes
let cards = [];

let client;

window.addEventListener('load', inicio);

async function inicio() {
  //Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
  client = await Ae.Aepp();
  console.log(client);
}

//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

//Create a asynchronous write call for our smart contract
async function contractCall(func, args, value) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

async function cardnew() {
  numero1.innerHTML = numero.value;
  monto1.innerHTML = monto.value;

  //Make the contract call to register the card with the newly passed values
  await contractCall('recarga_inicial', [numero.value, nombre.value, monto.value], 0);
}

async function recargar() {
  let mnt = parseFloat(monto1.innerHTML), trx = parseFloat(montotrx.value);
  monto1.innerHTML = mnt + trx;

  //Make the contract call to register the card with the newly passed values
  await contractCall('recarga', [numero.value, mnt + trx], 0);
}

async function consumir() {
  let mnt = parseFloat(monto1.innerHTML), trx = parseFloat(montotrx.value);
  monto1.innerHTML = mnt - trx;

  //Make the contract call to register the card with the newly passed values
  await contractCall('recarga', [numero.value, mnt - trx], 0);
}

// async function inicio() {
//   const client = await Ae.Aepp();
// }

// //Execute main function
// window.addEventListener('load', async () => {
//   //Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
//   client = await Ae.Aepp();
// });

// //If someone clicks to vote on a meme, get the input and execute the voteCall
// jQuery("#memeBody").on("click", ".voteBtn", async function(event){
//   $("#loader").show();
//   //Create two new let block scoped variables, value for the vote input and
//   //index to get the index of the meme on which the user wants to vote
//   let value = $(this).siblings('input').val(),
//       index = event.target.id;

//   //Promise to execute execute call for the vote meme function with let values
//   await contractCall('voteMeme', [index], value);

//   //Hide the loading animation after async calls return a value
//   const foundIndex = memeArray.findIndex(meme => meme.index == event.target.id);
//   //console.log(foundIndex);
//   memeArray[foundIndex].votes += parseInt(value, 10);

//   renderMemes();
//   $("#loader").hide();
// });

// //If someone clicks to register a meme, get the input and execute the registerCall
// $('#registerBtn').click(async function(){
//   $("#loader").show();
//   //Create two new let variables which get the values from the input fields
//   const name = ($('#regName').val()),
//         url = ($('#regUrl').val());

//   //Make the contract call to register the meme with the newly passed values
//   await contractCall('registerMeme', [url, name], 0);

//   //Add the new created memeobject to our memearray
//   memeArray.push({
//     creatorName: name,
//     memeUrl: url,
//     index: memeArray.length+1,
//     votes: 0,
//   })

//   renderMemes();
//   $("#loader").hide();
// });