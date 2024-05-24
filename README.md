# Online Quiz Game

## Project Overview

This project is an online quiz game developed using a Database Management System (DBMS). The application consists of four main pages: the Home page for user login and registration, the Quiz page where users participate in quizzes, the Scoreboard page to display user scores, and the Admin page for managing quiz questions.

## Features

- **User Authentication**: Users can register and log in to participate in quizzes.
- **Quiz Participation**: Users can take quizzes with multiple-choice questions and receive scores based on their performance.
- **Scoreboard**: Displays the scores of all users, showcasing the top performers.
- **Admin Management**: Admins can add, update, and delete quiz questions to keep the content fresh and challenging.

## Database Design

The application uses a relational database to manage users, quiz questions, and scores:

1. **Users Table**
   - `user_id`: Primary key
   - `username`: Unique username
   - `password`: Hashed password

2. **Questions Table**
   - `question_id`: Primary key
   - `question_text`: Text of the question
   - `option_a`: Option A text
   - `option_b`: Option B text
   - `option_c`: Option C text
   - `option_d`: Option D text
   - `correct_option`: Indicates which option is correct (A, B, C, or D)

3. **Scores Table**
   - `score_id`: Primary key
   - `user_id`: Foreign key referencing `Users`
   - `score`: User's score
   - `date_taken`: Date the quiz was taken
   - `username` : User's name

## Technology Stack

- **Backend**: Node.js with Express for server-side logic and database interactions
- **Frontend**: HTML, CSS, JavaScript for the user interface
- **Database**: MySQL for storing user data, questions, and scores

## Getting Started

1. **Clone the repository**:
   ```sh
   git clone https://github.com/Rupas01/onlinequiz.git
