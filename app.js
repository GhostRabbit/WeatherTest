/*jslint node: true*/
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const https = require('https');

const app = express();
const router = express.Router();

router.post('/GrabWeather', (req, res) => {
  
  var lon = req.body.lon;
  var lat = req.body.lat;
  https.get( {
    host : 'opendata-download-metfcst.smhi.se',
    path : '/api/category/pmp3g/version/2/geotype/point/lon/'
    + lon + '/lat/' + lat + '/data.json',
  }, (response) => {
    
    // Gather response body
    var body = '';
    response.on('data', (d) => {
      body += d;
    });

    // Data reception is done, do whatever with it!      
    response.on('end', () => {      
      var temps = JSON.parse(body).timeSeries.map( (entry) => {
        return {
          time : entry.validTime,
          temp : entry.parameters.filter( (param) => {
              return param.name == 't';
            }).map( (param) => {
              return param.values[0];
            })[0]
        }
      });
      res.render('temps.hbs',
      { 
        lon : lon,
        lat : lat,
        temps : temps
      }); 
    });
  }).end();
  
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
  })
); 
app.use(router);

app.engine(
  'hbs', 
  hbs({extname: 'hbs'})
);
app.set('view engine', 'hbs');

if (module === require.main) {
  const server = app.listen(process.env.PORT || 8081, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
}

module.exports = app;
