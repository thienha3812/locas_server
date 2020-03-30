var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./openapi.json');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var placesRouter = require('./routes/places');

var app = express();
// Connect database
require('./database/connect')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('etag', false); 

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));



app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/places',placesRouter);
app.use('/uploads/:file',async(req,res,next)=>{  
  try { 
    return res.sendFile(path.join(__dirname + '/uploads/' + req.params.file),function(err){
      if(err) throw new Error()
    })
  }catch(err){
    return res.sendStatus(500)
  }
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {  
  next(createError())
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
