# SiLA Database

# Table of Contents
- [SiLA Database](#sila-database)
- [Disclaimer](#disclaimer)
- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Pre-Requisites](#pre-requisites)
- [Steps to initialise the database](#steps-to-initialise-the-database)
- [What does `setup_db.sh` do?](#what-does-setup_dbsh-do)
- [What happens when setup is completed?](#what-happens-when-setup-is-completed)
- [How to take a snapshot of the database?](#how-to-take-a-snapshot-of-the-database)
- [Why do we need views in the database?](#why-do-we-need-views-in-the-database)
- [How to update the dataset?](#how-to-update-the-dataset)
- [Database Tables](#database-tables)

## Disclaimer
All data in this folder is artificial data meant for development and testing of application and in no way represent any client information.

## Overview
This guide will help developers setup the `sila_dev_db` on their local machine to facilitate the development of various features. Developers does not necessarily need to understand various relational database terms for this to work on their system. However, they will need to have a MySQL running on their system (`localhost`) and need to be aware of their root username and password. 

## Entity Relationship Diagram
Refer [Confluence](https://comp90082-2024-si-koala.atlassian.net/wiki/spaces/comp900822/pages/14909441/SiLA+ERD) or [Github](docs/sila_erd.pdf) for the latest production version of the ERD. If you see that the ERD is out of date please reach out to the team to get the information updated. 

Note: Refer this link to be able to generate the ERD using [MySQL Workbench](https://medium.com/@tushar0618/how-to-create-er-diagram-of-a-database-in-mysql-workbench-209fbf63fd03).

## Pre-Requisites
- `mysql` client running. This setup uses `mysql Ver 8.3.0` however, if some other version is incompatible, try upgrading it or reach out to the team for resolutions. 
- `mysqldump`, in most cases this is already installed with the `mysql` client. However, additional steps might be needed to be followed. 
- `bash` or `WSL` to run the database initialisation scripts.
    - Note: if using WSL, make sure `mysql` and `mysql-server` are also installed on WSL. There have been cases when MySQL is installed on Windows but not available for access to WSL. Follow the commands below for the setup on a Windows Machine.<br>
    (Note: You need to run the following commands on the Ubuntu Server after you have installed WSL. If you run it the command prompt directly you will get an error.)
    - `sudo apt update && sudo apt upgrade`
    - `sudo apt-get install mysql-client`
    - `sudo apt-get install mysql-server`
    - `sudo mysql`

    - To start sql, if sql is stopped, use this command below
        - sudo service mysql status (to check if it is stopped)
        - sudo service mysql start

    - if you get an error similar to this use the command below
    ```saurabh@zincsy:/mnt/d/Semester 4/Software Project/Git Repo/SI-Koala/data$ sudo bash setup_db.sh
        setup_db.sh: line 2: $'\r': command not found
        setup_db.sh: line 6: $'\r': command not found
        : No such file or directoryenv
        setup_db.sh: line 9: $'\r': command not found
        mysql: [Warning] Using a password on the command line interface can be insecure.
        '@'localhost' (using password: NO)for user 'root
        : No such file or directorysila_dev_db.sql
        setup_db.sh: line 14: $'\r': command not found ```
    
-  `sed -i 's/\r$//' setup_db.sh`

    - If the similar problem is happening with snapshot_db.sh, run:
-  `sed -i 's/\r$//' snapshot_db.sh`


## Steps to initialise the database
- Initialise an environment file inside `/data` folder called `.env` and set required params there like below.
    ```
        DB_HOST="localhost"
        MYSQL_USER="root"
        MYSQL_PWD="your_password"
    ```
- Run `sudo bash setup_db.sh sila_test_db` or `sudo bash setup_db.sh sila_dev_db` and input your administrator password when prompted.

## What does `setup_db.sh` do?
- Using the credentials mentioned in `data/.env`, the script creates a database called `DB_NAME` in your local `MySQL` host. 
- Using the the commands in `data/sila_dev_db.sql`, the application data is setup.
    - Create tables needed. 
    - Create integrity between the tables like foreign key constraints.
    - Insert the records into the created tables.

## What happens when setup is completed?
- You should be able to query the database by using the same credentials. Note, make sure `mysql` daemon is running in the background.
- You can use your choice of tool to interact with the data: MySQL Workbench, mysql cli, etc. 
- You will be also able to use the db programmatically. Make sure to set host to `localhost` and user to `root`. 

## How to take a snapshot of the database?
- `bash snapshot_db.sh sila_test_db` or `bash snapshot_db.sh sila_dev_db`

## Why do we need views in the database?
- Easy was for api to read data from the database.
- How to deploy views?
    - Create a view in `data/views` directory and name the file same as the name of the view.
    - Make sure all views have a name starting like `VW_*`. This is crucial for `mysqldump`

## How to update the dataset?
- The development team will keep iterating over to publish more tables, records, etc via the `sila_dev_db.sql` file so make sure you are in touch with the `main` branch. 
- **NOTE**: Please don't directly insert records in the file as it might cause data integrity issues.

