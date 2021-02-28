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

app.get('/',(req,res)=>{
    res.render('pages/index');
});
app.get('/searches/new',(req,res)=>{
    res.render('pages/searches/new');
});
app.get('/searches',handelSearches);

function handelSearches(req,res) {

    const url =`https://www.googleapis.com/books/v1/volumes?q=${req.body.select}+${req.body.input}`
// const url =`https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor`
superagent.get(url).then(data =>{
console.log(data.body.items);
let searchBook=data.body.items;
let book=searchBook.map(data=>new Book(data));
res.render('pages/searches/show')

})    
}
function Book(data) {
    this.title=data.body.items.volumeInfo.title;
    this.authors=data.body.items.volumeInfo.authors;
    this.image=data.body.items.volumeInfo.imageLinks;
    this.decr=data.body.items.searchInfo.textSnippet;   
}
app.listen(PORT, ()=>{
    console.log('server is listinig to '+ PORT);
});