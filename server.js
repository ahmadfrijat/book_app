'use strict'
const express = require('express');
const app = express();
const cors = require('cors');

const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT;

app.use(cors());
app.set('view engine', 'ejs')
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

// app.get('/',(req,res)=>{
//     res.render('pages/index');
// });
// app.post('/new', addBookToDB);
app.get('/', getAllBooks);
app.post('/selsctedBook', addBookToDB);
app.get('/books/:book_id', getSpecificBook);


app.get('/error', (req, res) => {
    res.render('pages/error');
});

app.get('/searches/new', (req, res) => {
    res.render('pages/searches/new');
});
app.post('/searches', handelSearches);


app.get('*', (req, res) => {
    res.render('pages/error');

});
function addBookToDB(req, res) {
    // console.log(req.body)
    let { image_url, title, author, description, isbn, bookshelf } = req.body
    let SQL = `INSERT INTO book (image_url, title, author, description, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)`
    let values = [image_url, title, author, description, isbn, bookshelf]

    client.query(SQL, values)
        .then(() => {
            res.redirect('/');
        }).catch(error => {
            res.render('/pages/error');
    
    
        });
}


function getAllBooks(req, res) {
    let SQL = `SELECT * FROM book;`;
    client.query(SQL)
        .then(data => {
            res.render('pages/index', { booksList: data.rows });
        }).catch(error => {
            res.render('/pages/error');
    
    
        });
}


function edaitSelected(req,res){
    // console.log(req.body)
    res.render('pages/books/show', {book:req.body})
}


function getSpecificBook(req,res){
    let SQL = `SELECT * FROM book WHERE id=$1`;
    let id = req.params.book_id;
    let values =[id];
    client.query(SQL,values)
    .then(data=>{
        // console.log(data.rows)
        res.render('pages/books/detail',{book: data.rows[0]});
    }).catch(error => {
        res.render('/pages/error');


    });
}

function handelSearches(req, res) {


    const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.select}+${req.body.input}`
    // const url =`https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor`


    console.log(req.body);
    superagent.get(url).then(data => {

        // console.log(data.body.items);
        let searchBook = data.body.items;
        let newBook = searchBook.map(data => new Book(data));
        // console.log(newBook);
        res.render('pages/searches/show', { books: newBook })

    }).catch(error => {
        res.render('/pages/error');


    });
}
function Book(data) {
    this.title = data.volumeInfo.title ? data.volumeInfo.title : "No Title Available";
    this.authors = data.volumeInfo.authors ? data.volumeInfo.authors : "No Authors";;
    this.image = data.volumeInfo.imageLinks.thumbnail ? data.volumeInfo.imageLinks.thumbnail : "https://i.imgur.com/J5LVHEL.jpg";
    this.decr = data.volumeInfo.description ? data.volumeInfo.description : "No description available";
}




// app.listen(PORT, () => {
//     console.log('server is listinig to ' + PORT);
// });
client.connect()
.then(()=>{
    app.listen(PORT, () => console.log('server is listinig to ' + PORT));
}).catch(error => {
    res.render('/pages/error');
});