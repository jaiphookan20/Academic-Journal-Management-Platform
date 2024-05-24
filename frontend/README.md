# Getting Started SI-Koala Development

This is just the setup for the iniital front end of the app.

## Table of Contents
- [Install](#npm-install)
- [Start](#npm-start)
- [Test](#npm-test)
- [Build](#npm-run-build)
- [Environment](#env-management)
- [Directory Structure](#directory-structure)

## Available Scripts

To start the project , type the command:

### `npm install`
Install the dependencies into the current directory into `node_modules/`. By default it looks for the `package.json` file to install dependencies. 

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

### Environment Management
- Create a `frontend/.env` file with below template:
    ```
    REACT_APP_API_HOST=localhost
    REACT_APP_HOST=localhost:3000
    ```
    [Refer Link](https://www.brntn.me/blog/using-environment-variables-in-a-react-app/)

## Directory Structure


## Directory Structure

The front end is divided into 4 sub Folders for easier management. It is as follows 
```
main
│
frontend
│
├─── public                     # Static assets like HTML files, images, etc.
│
├─── src                        # Contains platform deployment code on AWS
│   │ 
│   ├── assets                  # Media assets like images, fonts, etc.
│   │ 
│   ├── components              # React components
│   │ 
│   ├── App.css                 # Styles for the App component
│   │ 
│   ├── App.js                  # App component
│   │ 
│   ├── index.css               # Global styles
│   │ 
│   ├── index.js                # JavaScript entry point
│   │ 
│   ├── logo.svg                # Logo file
│   │ 
│   ├── reportWebVitals.js      # Analytics for web vitals
│   │ 
│   └── setupTests.js           # Setup file for test environment
│
├─── .env                       # Contains all the code for the application's front end.
│
├─── package.json               # Project manifest with dependencies and scripts
│
└─── README.md                  # README file for understanding the frontend side of the project.
```

