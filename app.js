var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require('request');
var cors = require('cors');

var baseUri='http://secure.simplypaid.com/api';
// var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
//app.use('/useragents/requesttokens', usersRouter);
function setResHeader(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,RequestID,X-Content-Type-Options,X-Content-Type-Options,X-Frame-Options,X-Powered-By,X-Version,x-xss-protection,Strict-Transport-Security') // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If neede
}

app.options('/**', cors(), function (req, res) {
  this.setResHeader(res);
  var redirectURL =baseUri + req.path;
  res.send(redirectURL);
});

app.post('/**', function (req, res, next) {
  setResHeader(res);
  var redirectURL =baseUri + req.path;
  request.post({ url: redirectURL, headers: req.headers, body: JSON.stringify(req.body) }, function (error, response, body) {
    if (response) {
      if (response.statusCode !== 200 && response.statusCode !== 201) {
        try {
          res.status(response.statusCode).send(response.body ? JSON.parse(response.body) : '');
        } catch (error) {
          next(createError(500));
        }
        
      } else {
        res.send(response.body);
      }
    }
    else {
      next(createError(404));
    }


  });
});

app.get('/**', function (req, res, next) {
  setResHeader(res);
  
  var redirectURL =baseUri + req.path;
    request.get({ url: redirectURL, headers: req.headers }, function (error, response, body) {
      if (response) {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          try {
            res.status(response.statusCode).send(response.body ? JSON.parse(response.body) : '');
          } catch (error) {
            next(createError(500));
          }
          
        } else {
          res.send(response.body);
        }
      }
      else {
        next(createError(404));
      }

    });

  

});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

module.exports = app;
