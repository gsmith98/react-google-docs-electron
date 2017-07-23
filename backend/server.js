const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  console.log(req.body);
  res.json({success: 'hhuh', thing: req.body})
});

app.post('/login', (req, res) => {
  console.log(req.body);
  res.json({success: 'hhuh', thing: req.body})
});

app.listen(3000, function () {
  console.log('Backend server for Electron App running on port 3000!')
});
