const express = require('express');
const {connect} = require('./database/conn.js');
const {EVChargeStation} = require('./database/data.js');
const app = express();
app.use(express.json());
const port = 8080;

app.get('/', (req, res) => {
  try {
    res.json('Home');
  } catch (error) {
    res.json({error});
  }
});
// post the data to database
app.post('/products', async (req, res) => {
  try {
    const product = await EVChargeStation.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message});
  }
});
// get all the details from db
app.get('/get-all-station-details-and-charge-points', async (req, res) => {
  try {
    const products = await EVChargeStation.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});
// given the connector-Type fetch necessay details
app.get('/station-details-and-charge-points/:connectorType', async (req, res) => {
  try {
    const {connectorType} = req.params;
    const chargeStations = await EVChargeStation.find({'connectors.name': connectorType});
    if (chargeStations.length === 0) {
      return res.status(404).json({message: 'No stations found with the specified connector type'});
    }

    res.json(chargeStations);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});
// given id of item to delete
app.delete('/delete-station-detaills-and-charge-points/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const product = await EVChargeStation.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({message: `cannot find any product with ID ${id}`});
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});


connect()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.log('Invalid Database Connection:', error);
    });


