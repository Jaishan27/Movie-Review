# Movie Review Web App

## Description

The **Movie Review Web App** is an interactive web application that allows users to review and rate movies, and receive AI-powered movie recommendations based on their reviews. Users can also switch between light and dark mode, and store their reviews and ratings on Firebase, which also handles user authentication. The app uses the OpenAI API to provide personalized movie recommendations and Firebase for seamless user experience and data storage.

## Features

- **User Authentication**: Users can sign up, log in, and log out via Firebase Authentication.
- **Movie Reviews**: Users can search for movies, write reviews, and rate them.
- **AI-Powered Movie Recommendations**: The app uses OpenAI's GPT-4 API to recommend movies based on users' reviews.
- **Dark/Light Mode**: Users can toggle between dark and light mode for a personalized UI experience.
- **Firebase Integration**: Firebase is used for authentication and storing users' reviews and ratings.

## Technologies Used

- **HTML/CSS**: Frontend technologies used for the user interface.
- **JavaScript**: Core scripting language for app functionality.
- **OpenAI GPT-4 API**: Used to generate personalized movie recommendations based on user reviews.
- **Firebase**: Provides user authentication and stores user reviews and ratings.
- **Node.js & Express**: Backend server for routing and handling requests.
- **npm**: Node package manager for managing dependencies.
- **Dark/Light Mode**: CSS media queries to allow users to switch themes.

## How It Works

1. **User Authentication**: 
   - Users can sign up or log in via Firebase Authentication.
   - Firebase handles authentication, allowing users to securely store and manage their movie reviews.
   
2. **Movie Reviews**:
   - Users can search for movies and add reviews and ratings.
   - Reviews and ratings are stored in Firebase Firestore, ensuring data persistence.

3. **Movie Recommendations**:
   - After reviewing a movie, the app sends the review text to the OpenAI API.
   - OpenAI's GPT-4 model analyzes the review and suggests movies based on the user's preferences and review content.

4. **Dark/Light Mode**:
   - The user can toggle between dark and light mode via a button.
   - The theme is dynamically applied using CSS to create a smooth user experience.

5. **Firebase Integration**:
   - Firebase handles the storage of user data (reviews, ratings) and user authentication, providing a secure and real-time experience.

# How to Run the Application

1. **Clone the Repository**:  
   First, clone the repository to your local machine by running the following command:
   - git clone https://github.com/JaishanJ/Movie-Review.git
   - cd Movie-Review

2. **Install Dependencies**:  
   Make sure you have Node.js installed. Then, install the required dependencies by running:
   - npm install

3. **Set up Firebase**:  
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Create a new Firebase project.
   - Set up Firebase Authentication and Firestore Database.
   - Download your `firebaseConfig` file and add it to the project.

4. **Start the Application**:  
   After installing the dependencies, run the app locally by executing:
   - npm start
     
5. **Access the Application**:  
- Open your browser and go to: http://localhost:3000

# Future Improvements

- **Enhanced Movie Recommendations**: The current movie recommendations are based on the review text using the OpenAI API. In the future, machine learning models can be added to enhance movie recommendation accuracy by incorporating user preferences and historical ratings.

- **Mobile Application**: The app could be expanded to mobile platforms, making it accessible to users on the go.

- **Social Features**: Users could follow friends, share reviews, or create shared watchlists for a more interactive social experience.

- **Movie Watchlist**: Add functionality for users to create and manage a watchlist, helping them track movies they've watched or want to watch.

- **Improved UI/UX**: Enhance the dark/light mode feature with smoother transitions and a more polished user interface, making the app more visually appealing and user-friendly.

- **Search by Genre/Director/Actor**: Expand the search functionality to allow users to search for movies based on different filters, such as genre, director, or actor.

- **Cloud Deployment**: Deploy the application on platforms such as Heroku, AWS, or Google Cloud to allow users to access it online without needing to run it locally.



