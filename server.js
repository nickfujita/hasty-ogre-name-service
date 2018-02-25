const path = require('path');
const express = require('express');

const app = express();

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(9000, 'localhost', function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:9000');
});
