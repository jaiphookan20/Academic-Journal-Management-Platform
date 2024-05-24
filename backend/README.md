# SiLA Backend

# Table of Contents
1. [SiLA Backend](#sila-backend)
3. [Overview](#overview)
4. [Pre-Requisites](#pre-requisites)
5. [Steps to run the backend](#steps-to-run-the-backend)
6. [Backend Architecture](#backend-architecture)
7. [Naming conventions](#naming-conventions)
8. [Directory Structure](#directory-structure)

## Overview
This guide will help developers setup and run the backend on their local machine to facilitate the development of various features. The developers will require node js installed on their system and an appropriate IDE to get the backend running.

## Pre-Requisites
- `nodejs`- latest version of node js is required to be installed in the local machine to facilitate development 
- `mysql` client running. This setup uses `mysql Ver 8.3.0` however, if some other version is incompatible, try upgrading it or reach out to the team for resolutions. 

## Steps to run the backend
- Add the required secrets into the shell environment variables using below two methods:
  1. Manually export every env variable like `export DB_NAME = sila_dev_db` and `export DB_USER=root`, etc.
  2. Create an `.env` file in the root directory of `backend/.env` and add required variables like below:
    ```
      DB_HOST="localhost"
      DB_USER="db_user"
      DB_PWD="db_password"
      DB_PORT="3306"
      DB_NAME="dev-db-name"
      TEST_DB_NAME="test-db-name"
      JWT_SECRET="some_secret"
      EMAIL="email@gmail.com"
      EMAIL_PASSWORD="email-pwd"
      S3_BUCKET="bucket-name"
    ```


PLEASE CONTACT THE BACKEND TEAM FOR `JWT_SECRET` AND `EMAIL_PASSWORD`

- Run `npm i` from within the backend folder.
- Run `nodemon server.js` from within the backend folder.
- For Windows Only (Database server needs to run using the root user and the password: Use `sudo mysql -u root -p` command)
- If a Windows Execution Policy Error occurs, run the following command in Windows Powershell (Run as administrator) `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
- For testing requests, the reviewer shall be added to the postman project during peer review. 

## Unit tests

- Unit test are available (Jest and SuperTest). Run `npm test` for running unit tests

## Backend Architecture
In this application, we implement the Model-Controller-Service (MCS) architecture which involves separating the concerns of data structure(Model) from the request handling (controller) and application flow control(service). Although traditionally associated with Model-View-Controller (MVCS), in the context of Node.js, the view layer is to be handled separately, through a client-side framework in React.

## Naming conventions
- Use capital letter for the first letter of entity or constructor defenitions
- Use entirely small letters for all other identifiers including function names and variable names. Words will be seperated using underscores for better readability.  

## Directory Structure

The back end structure is as follows 
```
main
│
backend
│
├── app
│   │
│   ├── config        # Configuration files and settings
│   │
│   ├── controllers   # Controller files to handle client requests
│   │
│   ├── models        # Data models for the application's database
│   │
│   ├── routes        # Route definitions for the application's endpoints
│   │
│   ├── services      # Business logic and service layer
│   │
│   ├── test          # Automated tests for the application
│   │
│   └── utilities     # Utility scripts and helper functions
│   
├── node_modules      # Node.js modules
│   
├── .eslintrc.js      # ESLint configuration
│   
├── package.json      # Project manifest with dependencies and scripts
│   
├── README.md         # Documentation about the backend
│   
└── server.js         # Entry point for the server application