const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient.connect("mongodb+srv://NodeCourseGaire:ePkZRBNZ1yLlw3Dm@cluster0.1lfsqne.mongodb.net/nodeCourse?retryWrites=true&w=majority")
    .then(client => {
        console.log("Connected To Atlas");
        _db = client.db();
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if(_db){
        return _db;
    }
    throw "No database Found"
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
