const testHost = require('./testHost');
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
// ...require other modules as needed...

const app = express();

const port = process.env.PORT || 3007;

// In-memory storage for employee accounts and articles
const employees = {};
const adminAccounts = {
  'joshuaszymanski@bird-dogscryptoleads.com': 'Zynaholic20$$!',
  'roccovalentino@bird-dogscryptoleads.com': 'Zynaholic20$$!'
};
const articlesFilePath = path.join(__dirname, 'articles.json');
let articles = [];

// Load articles from the JSON file
if (fs.existsSync(articlesFilePath)) {
  const articlesData = fs.readFileSync(articlesFilePath);
  articles = JSON.parse(articlesData).articles || [];
}

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve static files from the 'templates' directory
app.use(express.static('templates'));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure index.html is served as the home page
});

// Add a route for the correspondent page
app.get('/correspondent', (req, res) => {
  fs.readFile(path.join(__dirname, 'articles.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading articles data');
      return;
    }
    const articles = JSON.parse(data).articles;
    res.render('correspondent', { articles });
  });
});

// Add a route for the paper-trading page
app.get('/paper-trading', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paper-trading.html'));
});

// Add a route for the employee login page
app.get('/employee-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'employee-login.html'));
});

// Add a route for the employee registration page
app.get('/employee-register', (req, res) => {
  const { username, password } = req.query;
  if (adminAccounts[username] && adminAccounts[username] === password) {
    res.sendFile(path.join(__dirname, 'public', 'employee-register.html'));
  } else {
    res.status(403).send('Access denied');
  }
});

// Add a route for the upload article page
app.get('/upload-article', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload-article.html'));
});

// Add a route for the crypto search
app.get('/search', (req, res) => {
  const symbol = req.query.search.toUpperCase();
  res.render('crypto-chart', { symbol });
});

// Add a route for employee sign-in
app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  if ((employees[username] && employees[username] === password) || (adminAccounts[username] && adminAccounts[username] === password)) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// Add a route for employee registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (employees[username]) {
    res.send({ success: false, message: 'Username already exists' });
  } else {
    employees[username] = password;
    res.send({ success: true });
  }
});

// Add a route for article upload
app.post('/upload', upload.single('image'), (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  const articleId = articles.length + 1;
  articles.push({ id: articleId, title, content, image });
  fs.writeFileSync(articlesFilePath, JSON.stringify({ articles }, null, 2));
  console.log(`Article titled "${title}" has been uploaded.`);
  res.send({ success: true });
});

// Add a route for the admin page
app.get('/admin', (req, res) => {
  const { username, password } = req.query;
  if (adminAccounts[username] && adminAccounts[username] === password) {
    res.render('admin', { articles });
  } else {
    res.status(403).send('Access denied');
  }
});

// Add a route for deleting articles (only accessible from the admin page)
app.delete('/admin/article/:id', (req, res) => {
  const { username, password } = req.body;
  if (adminAccounts[username] && adminAccounts[username] === password) {
    const articleId = parseInt(req.params.id, 10);
    const articleIndex = articles.findIndex(a => a.id === articleId);
    if (articleIndex !== -1) {
      articles.splice(articleIndex, 1);
      fs.writeFileSync(articlesFilePath, JSON.stringify({ articles }, null, 2));
      res.send({ success: true });
    } else {
      res.status(404).send({ success: false, message: 'Article not found' });
    }
  } else {
    res.status(403).send({ success: false, message: 'Access denied' });
  }
});

// Add routes for individual article pages
app.get('/article/:id', (req, res) => {
  const articleId = parseInt(req.params.id, 10);
  const article = articles.find(a => a.id === articleId);
  if (article) {
    res.render('article', { articleId: article.id, articleTitle: article.title, articleContent: article.content });
  } else {
    res.status(404).send('Article not found');
  }
});

// Start the server first
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Add error event listener to handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Execute the Gulp tasks to compress images and videos
exec('gulp', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error executing Gulp tasks: ${err}`);
    return;
  }
  console.log(`Gulp tasks output: ${stdout}`);
  console.error(`Gulp tasks errors: ${stderr}`);

  // Execute the code from the required modules
  testHost.mainFunction();
  // ...existing code...
});
