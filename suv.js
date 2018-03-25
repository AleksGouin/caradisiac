const React = require("react");
const elasticsearch = require("elasticsearch");
const axios = require ("axios");
const express = require("express");
const router = express.Router();



let client = new elasticsearch.Client({
    host: 'localhost:9200',
    //log: 'trace'
  });

router.get('/', function(req, res, next) {
  console.log("Salut");
  next();
})
/*
class DataComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          suv: []
        };
    }

    componentDidMount() {
        // this.DataComponent();
        axios.get('http://localhost:9200/models/')
        .then(res => {
          const suv = res.data;
          this.setState({suv});
        });
    }

    
  render() {
      console.log(this.state.suv)

    return (
      <div>
          {this.state.suv.map(function(voiture) {
            return <p>{voiture.brand}</p>
          })}
      </div>
    );
  }
}

DataComponent.defaultProps = {
};

export default DataComponent;*/