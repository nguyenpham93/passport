
const elas = require("./elastic/index");
const moment = require("moment");
const shortid = require("shortid");
const async = require("async");

//Create Index
function createIndex () {
    elas.createIndex("passport",(err,stt)=>{
        if (err) {
            console.log(err);
        } else {
            console.log(stt);
        }
    });
}
// createIndex();

//Delete Index
function deleteIndex () {
    elas.deleteIndex("passport",(err, stt)=>{
        if (err) console.log(err);
        else console.log(stt);
    });
}
// deleteIndex();


// Add add Author
let author = {
    "id" :  'rJBkgtYyb',
    "name" : "bluevn",
    "email" : "blueevn@gmail.com",
    "password" : "secret",
    "description" : "Nodejs programmer",
    "website" : "https://www.passport.com",
    "data" :  moment().format("DD/MM/YYYY")
}

function addAuthor (author){
    elas.insertDocument ("passport", "users", author)
    .then ((data) => {
        console.log(data);
    });
}
// addAuthor(author);




function deleteDocument (){
    elas.deleteDocument ("passport","collection", "B1xX6bwd1W")
    .then ( data => {
        console.log (data);
    }, 
    err => {
        console.log (err);
    });
}
// deleteDocument();

// Add Like & Dislike
let like = {
    "id_collection" : "H18Eg10dgk-",
    "id_user"  : "r1QCo_xkb",
    "status"   : "like",
    "date"     : moment().format("DD/MM/YYYY")
}

function addLike () {
    elas.insertDocument ("passport", "like_dislike", like)
    .then ((data) => {
        console.log(data);
    });
}
// addLike();

// Search ALl for test
function searchAll (){
	elas.searchAll("passport","users")
 .then (data => {
     console.log(data);
 });
}
searchAll(); 
// elas.search("passport","collection", '#FE4365')
// .then (data => {
//     console.log(data);
// });

