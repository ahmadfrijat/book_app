'use strict'
const express = require('express');
const app = express();
const cors = require('cors');

const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT;

app.use(cors());
app.set('view engine', 'ejs')
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.render('pages/index');
});

app.get('/error', (req,res)=>{
    res.render('pages/error'); 
}); 

app.get('/searches/new',(req,res)=>{
    res.render('pages/searches/new');
});
app.post('/searches',handelSearches);


app.get('*', (req,res)=>{
    res.render('pages/error'); 

});




function handelSearches(req,res) {
    

    const url =`https://www.googleapis.com/books/v1/volumes?q=${req.body.select}+${req.body.input}`
// const url =`https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor`


console.log(req.body);
superagent.get(url).then(data =>{

// console.log(data.body.items);
let searchBook=data.body.items;
let newBook=searchBook.map(data=>new Book(data));
// console.log(newBook);
res.render('pages/searches/show',{books:newBook})

}).catch(error => {
    res.render('/pages/error');


});
}
function Book(data) {
    this.title=data.volumeInfo.title? data.volumeInfo.title: "No Title Available";
    this.authors=data.volumeInfo.authors? data.volumeInfo.authors: "No Authors";;
    this.image=data.volumeInfo.imageLinks.thumbnail? data.volumeInfo.imageLinks.thumbnail:"https://i.imgur.com/J5LVHEL.jpg";
    this.decr=data.volumeInfo.description? data.volumeInfo.description:"No description available";   
}




app.listen(PORT, ()=>{
    console.log('server is listinig to '+ PORT);
});