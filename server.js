'use strict'
const express = require('express');
const app = express();
const cors = require('cors');

const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');
const override = require('method-override');
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });
const PORT = process.env.PORT;

app.use(cors());
app.set('view engine', 'ejs')
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(override('_method'));
// app.get('/',(req,res)=>{
//     res.render('pages/index');
// });
app.post('/new', addBookToDB);
app.get('/', getAllBooks);
app.post('/edit', edaitSelected);
app.get('/books/:book_id', getSpecificBook);
app.put('/update:book_id',updateBook)
app.post('/update/:book.id?_method=PUT',updatrForm)


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
function updatrForm(req,res) {
    res.render('/pages/books/edit');
}


function updateBook(req,res) {
    let id = req.params.book_id;
    let updateValues = req.body;
    let SQL = 'UPDATE books SET image = $1, title = $2, authors = $3, decr = $4, isbn = $5, bookshelf = $6 WHERE id=$7;';
    let values=[updateValues.image,updateValues.title,updateValues.authors,updateValues.decr,updateValues.isbn,updateValues.bookshelf,id] 
    client.query(SQL, values).then(()=>{
        res.redirect('/books/id',{book: data.rows[0]}).catch(error => {
            res.render('/pages/error');
    
    
        });
    })
}

function addBookToDB(req, res) {
    // console.log(req.body)
    // let { image, title, authors, decr, isbn, bookshelf } = req.body
   let SQL= `insert into books(image, title, authors, decr, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6)returning *;`;
    // let SQL = `INSERT INTO books (image, title, authors, decr, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
    let reqBody = req.body;
    let values = [reqBody.image, reqBody.title, reqBody.authors, reqBody.decr, reqBody.isbn, reqBody.bookshelf];

    client.query(SQL, values)
        .then((data) => {
            console.log(data);
            res.redirect('/');
        }).catch(error => {
            res.render('/pages/error');
    
    
        });
}


function getAllBooks(req, res) {
    let SQL = `SELECT * FROM books;`;
    client.query(SQL)
        .then(data => {
            // console.log(data.rows);
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
    let SQL = `SELECT * FROM books WHERE id=$1`;
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