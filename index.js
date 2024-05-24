const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const bcrypt = require('bcryptjs');
const db = require('./config/db'); // Import your database configuration

const app = express();


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' directory




app.get('/', (req, res) => {
    res.render('home');
});






// Route for handling registration form submission
app.post('/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    // Check if username already exists in the database
    db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).send('Error querying database');
        }
        if (results.length > 0) {
            return res.status(400).send('Username already exists');
        }
        // Insert the new user into the database
        db.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
            if (err) {
                return res.status(500).send('Error registering user');
            }
            res.redirect('/'); // Redirect to home page after successful registration
        });
    });
});









app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if username exists in the database
    db.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).send('Error querying database');
        }
        if (results.length === 0) {
            return res.status(400).send('Invalid username or password');
        }

        // Compare the password with the password stored in the database
        const user = results[0];
        if (password !== user.password) {
            return res.status(400).send('Invalid username or password');
        }

        // Set req.session.isAuthenticated to true to indicate that the user is authenticated
        req.session.isAuthenticated = true;

        req.session.userId = user.user_id;
        req.session.username = user.username;

        // Redirect to the quiz page
        return res.redirect('/quiz');
    });
});


app.post('/submit-quiz', isAuthenticated, (req, res) => {
    const userAnswers = req.body; // Assuming answers are submitted directly from the form inputs


    const userId = req.session.userId;
    const username = req.session.username;

    // Fetch all questions and their correct options from the database
    db.query('SELECT question_id, correct_option FROM Questions', (err, rows) => {
        if (err) {
            return res.status(500).send('Error fetching questions');
        }

        // Calculate the score based on user's answers and correct options
        let score = 0;
        for (let i = 0; i < rows.length; i++) {
            const questionId = rows[i].question_id;
            const correctOption = rows[i].correct_option;
            const userAnswer = userAnswers[`answer_${i}`]; // Assuming answers are submitted with keys like 'answer_<index>'
        
        
            if (userAnswer === correctOption) {
                score++;
            }
        }


        // Insert the quiz result into the Scores table
        db.query('INSERT INTO Scores (user_id, username, score, date_taken) VALUES (?, ?, ?, NOW())', 
            [userId, username, score],
            (err, result) => {
                if (err) {
                    return res.status(500).send('Error saving quiz result');
                }
                res.redirect('/'); // Redirect to home page after saving the quiz result
            }
        );
    });
});








// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    // Check if user is authenticated
    if (req.session.isAuthenticated) {
        // If authenticated, proceed to the next middleware or route handler
        next();
    } else {
        // If not authenticated, redirect to the login page
        res.redirect('/login');
    }
}

// Route for the quiz page (protected by authentication)
app.get('/quiz', isAuthenticated, (req, res) => {
    // Fetch questions from the database
    db.query('SELECT * FROM Questions', (err, questions) => {
        if (err) {
            return res.status(500).send('Error fetching questions');
        }
        // Render the quiz page and pass the questions data to the template
        res.render('quiz', { questions });
    });
});






// Route for the scoreboard page
app.get('/scoreboard', (req, res) => {
    // Query the Scores table to fetch scores in descending order
    db.query('SELECT username, score FROM Scores ORDER BY score DESC', (err, scores) => {
        if (err) {
            return res.status(500).send('Error fetching scores');
        }
        // Render the scoreboard EJS template and pass the scores data
        res.render('scoreboard', { scores });
    });
});







// Route for the admin page
app.get('/admin', (req, res) => {
    res.render('admin');
});







// Route for deleting a question
app.post('/admin/delete', (req, res) => {
    const questionId = req.body.questionId; // Assuming the form sends the question ID
    // Delete the question from the database
    db.query('DELETE FROM Questions WHERE question_id = ?', [questionId], (err, result) => {
        if (err) {
            res.status(500).send('Error deleting question');
            return;
        }
        res.redirect('/admin');
    });
});

// Route for editing a question
app.post('/admin/edit', (req, res) => {
    const { questionId, questionText, optionA, optionB, optionC, optionD, correctOption } = req.body;
    // Update the question in the database
    db.query('UPDATE Questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ? WHERE question_id = ?',
        [questionText, optionA, optionB, optionC, optionD, correctOption, questionId],
        (err, result) => {
            if (err) {
                res.status(500).send('Error editing question');
                return;
            }
            res.redirect('/admin');
        });
});

// Route for adding a question
app.post('/admin/add', (req, res) => {
    const { questionText, optionA, optionB, optionC, optionD, correctOption } = req.body;
    // Insert the new question into the database
    db.query('INSERT INTO Questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)',
        [questionText, optionA, optionB, optionC, optionD, correctOption],
        (err, result) => {
            if (err) {
                res.status(500).send('Error adding question');
                return;
            }
            res.redirect('/admin');
        });
});








// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
