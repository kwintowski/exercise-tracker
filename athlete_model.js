var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//create Mongo Schemas
const athleteSchema = new Schema({
  _id: {type: String, required: true},
  username:  {type: String, required: true},
  dateStamp: {type: Date, required: true}
}, {collection: 'TrackerCollection', _id: false });

const exerciseSchema = new Schema({
  userid:  {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  dateStamp: {type: Date, required: true}
}, {collection: 'TrackerCollection'});

//Then define discriminator field for schemas:
const baseOptions = {
    discriminatorKey: '__type',
    collection: 'TrackerCollection'
};

//Define base model, then define other model objects based on this model:
const Base = mongoose.model('Base', new Schema({}, baseOptions));
const AthleteModel = Base.discriminator('AthleteModel', athleteSchema);
const ExerciseModel = Base.discriminator('ExerciseModel', exerciseSchema);

module.exports = {
   Base: Base,
   Athlete: AthleteModel,
   Exercise: ExerciseModel
};
