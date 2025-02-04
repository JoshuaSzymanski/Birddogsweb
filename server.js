const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const ffmpeg = require('fluent-ffmpeg');
const phpExpress = require('php-express')({
    binPath: 'php' // Replace with the path to your PHP binary if necessary
});
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine to PHP-express
app.set('views', path.join(__dirname, 'public'));
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');

// Use PHP-express to handle PHP files
app.all(/.+\.php$/, phpExpress.router);

// Example route using ffmpeg
app.post('/process-video', (req, res) => {
    const inputPath = 'path/to/input/video.mp4';
    const outputPath = 'path/to/output/video.mp4';

    ffmpeg(inputPath)
        .output(outputPath)
        .on('end', () => {
            res.send('Video processing completed');
        })
        .on('error', (err) => {
            console.error('Error processing video:', err);
            res.status(500).send('Error processing video');
        })
        .run();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/correspondent', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'correspondent.html'));
});

app.get('/paper-trading', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'paper-trading.html'));
});

// Add a route for the employee login page
app.get('/employee-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'employee-login.html'));
});

// Add a route for the crypto search
app.get('/search', (req, res) => {
    const symbol = req.query.search.toUpperCase();
    res.render('crypto-chart', { symbol });
});

// Add a route for employee sign-in
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    if (username === 'employee' && password === 'password') {
        res.send({ success: true });
    } else {
        res.send({ success: false });
    }
});

// Add a route for article upload
app.post('/upload', (req, res) => {
    const { title, content } = req.body;
    // Simulate article upload process
    console.log(`Article titled "${title}" has been uploaded.`);
    res.send({ success: true });
});

// Add a route to handle article insertion
app.post('/insert_article', (req, res) => {
    const article = req.body;
    console.log('Article received:', article);
    // Implement your logic to handle the article upload
    // For example, save the article to a database
    // db.collection('articles').insertOne(article, (err, result) => {
    //     if (err) {
    //         res.status(500).send('Error inserting article');
    //     } else {
    //         res.status(200).send('Article inserted successfully');
    //     }
    // });

    // For now, just send a success response
    res.status(200).send({ success: true, message: 'Article inserted successfully' });
});

// Add routes for individual article pages
app.get('/article/:id', (req, res) => {
    const articleId = req.params.id;
    res.render('article', { articleId });
});

// Add a route to serve the new article upload page
app.get('/upload-article', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload-article.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
