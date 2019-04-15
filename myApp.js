var express = require('express');
var app = express();
var bodyParser = require('body-parser');

console.log("Hello World");

var Base_;
var Base;
var Athlete;
var Exercise;
try {
  Base_ = require("./athlete_model.js");
  Base = Base_.Base;
  Athlete = Base_.Athlete;
  Exercise = Base_.Exercise;
} catch (error) {
  console.log("Problem using Athlete Model Module");
}

var getNewId = function(col, next, done) {
  
  col.countDocuments({}, function(err, count){
    if(err) done(err);
    console.log( "Number of records: ", count );
    done(count);
  });
}

var createNewUser = function(res, username, newId, done) {
    
  Athlete.find({username: username}).then(function(result) {
    if(result.length<1) {
      let curDate = new Date().toISOString().split('T')[0];
      console.log(`Inserting ${newId}`);
      var document = new Athlete({_id:newId,username:username,dateStamp:curDate});

      document.save(function(err, data) {
        if(err) return done(err);
        console.log('Creating User...');
        res.send({"username":data.username,"_id":data._id});
        //done(null);
      })
    }
    else {
      console.log(`Short URL Already exists: ${result[0].username}`)
      res.send("User already exists, please try another username");
    }
  });
};

var getAllUsers = function(res, done) {
    
  Athlete.find({}, function(err,data) {
    if(err) done(err);
    console.log(data);
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(data, null, 4));
    //done(data);
  });
}

var getUserById = function(userId) {
  return new Promise((resolve, reject) => {
    Athlete.findById(userId).exec(function(err,data) {
    if (err || !data) {
       reject(err);
    }
    else {
      resolve(data);
    }
    });
  })
}


var getUser = function(res, userId, options, done) {
    
  var ath = {};
  var log = [];
  var fromDate = (options[0]==null?new Date(0):new Date(options[0]));
  var toDate = (options[1]==null?new Date():new Date(options[1]));
  var limit = (isNaN(options[2])?null:+options[2]);
  
  getUserById(userId)
  .then(data=>{
    if(data){
      ath=data;
      Exercise.find({userid: userId, dateStamp: {$gte: fromDate, $lte: toDate}},null,{limit:limit}, function(err,data2) {
      if(err) done(err);
      console.log(data2);
      for (const val of data2) {
        log.push((({ description, duration, dateStamp }) => ({ description, duration, dateStamp }))(val));
      }
      for (const obj of log) {
        obj.dateStamp = obj.dateStamp.toISOString().split('T')[0];
      }
      ath.count = data2.length;
      ath.log = log;
      
      res.header("Content-Type",'application/json');
      res.send(JSON.stringify((({ _id, username, count, log }) => ({ _id, username, count, log }))(ath)));
      })
    }
  })
  .catch(err => {
      res.status(500).json({ error : err });
    });
  
      
}

var addExercise = function(res,exercise,done) {

      var document = new Exercise({userid:exercise[0],description:exercise[1],duration:parseInt(exercise[2]),dateStamp:exercise[3]});

      document.save(function(err, data) {
        if(err) return done(err);
        console.log('Adding Exercise...');
        res.send({"userid":data.userid,"description":data.description,"duration":data.duration,"date":data.dateStamp.toISOString().split('T')[0]});
        //done(null);
      });
}
/** Get data from POST  */
app.route('/api/exercise/new-user')
  .post(function(req,res){
    getNewId(Athlete,null,function(data) {
      createNewUser(res,req.body.username,data);
    })
  });

//get all unique users
app.get("/api/exercise/users",function(req,res){getAllUsers(res);});

// Get User Log for a specific user
app.get("/api/exercise/log", function(req,res){
  var userId = req.query.userId;
  var options = [
    req.query.from,
    req.query.to,
    req.query.limit
  ]
  console.log(options);
  getUser(res,userId,options);
});

app.route('/api/exercise/add')
  .post(function(req,res){
    var exercise = [
      req.body.userId,
      req.body.description,
      req.body.duration,
      (req.body.date.length>0?req.body.date:new Date().toISOString().split('T')[0])
      ];
    addExercise(res,exercise);
});


module.exports = app;