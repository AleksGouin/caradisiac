var express = require('express');
var router = express.Router();
const elasticsearch = require('elasticsearch');
const async = require('async');
const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');

var client = new elasticsearch.Client({
    host : 'localhost:9200',
    log : 'trace'
})

var modelList = [];

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {title: 'Express'});
});

router.get('/populate', async function(req, res, next) {
    await populate();
    res.send("indexage terminé");
});

router.get('/search', async function(req, res, next){
    let qres = await search();
    res.json(qres);
});

router.get('/map', async function(req, res, next){
    await map();
    res.send("indexage terminé");
})

router.get('suv', function(req, res, next) {
	let results = [];
	client.search({
		index: 'models',
		type : 'model',
		body : {
			size: 10,
			query : {
				match_all:{},
			},
			sort:{
				"volume.keyword": {
					order: "desc"
				}
			}
		}
	}).then(function (res) {
		res.hits.hits.forEach(model => {
			results.push(model['_source']);
		});
		
	}, function (err) {
		console.trace(err.message);
	}).then(() => {
		res.json(results);
	});
})

async function asyncGetModels(){
    let models = await getModels('PEUGEOT');
    models.forEach(element => {
        let index = {index : {_index : "models", _type : "model", _id : element.uuid}};
        modelList.push(index);
        modelList.push(element);
    });
}

async function populate(){
    console.log("Récupération des modèles")
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
    });
}

async function map(){
    var body = {
        model : {
            properties : {
                brand : {"type" : "text", "fielddata" : true},
                model : {"type" : "text", "fielddata" : true},
                volume : {"type" : "text", "fielddata" : true}
            }
        }
    }
    client.indices.putMapping({index:"models", type:"model", body:body});
}

async function search(){
    let res = await client.search({
        index : "models",
        type : "model",
        q : "brand:PEUGEOT",
        size : 50
    });
    let modelList = [];
    console.log("passe ici");
    res.hits.hits.forEach(function(element){
        modelList.push(element._source);
    })
    modelList = sort(modelList);
    return modelList;
}

function maxVolumeIndex(list){
    let i = 0;
    let imax = 0;
    while(list[i].volume == ""){
        i++;
        imax++;
    }
    let max = parseInt(list[i].volume);
    list.forEach(function(element){
        if (element.volume != ""){
            if (parseInt(element.volume) > max){
                max = parseInt(element.volume);
                imax = i;
            }
        }
        i++;
    })
    return imax;
}

function sort(list){
    console.log("sort");
    let sortedList = [];
    for(i = 0; i < 10; i++){
        let maxIndex = maxVolumeIndex(list);
        sortedList.push(list[maxIndex]);
        list.splice(maxIndex,1);
    }
    return sortedList;
}

module.exports = router;
