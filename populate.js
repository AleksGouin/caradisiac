const async = require('async');
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
const elasticsearch = require('elasticsearch');

var modelList = [];

async function asyncGetModels(){
  let models = await getModels('PEUGEOT');
  models.forEach(element => {
    let index = {index : {_index : "models", _type : "model", _id : element.uuid}};
    modelList.push(index);
    modelList.push(element);
  });
  console.log(modelList);
}

async function main(){
  
  var client = new elasticsearch.Client({
    host : 'localhost:9200',
    log : 'trace'
  });

  await asyncGetModels();

  console.log("Début de l'indexage")
  client.bulk({
    body : modelList
  },
  function(error, response){
    if (error){
        console.log(error);
    }
    else{
        console.log(response);
        console.log("indexation terminée");
    }
  })
}

asyncGetModels();