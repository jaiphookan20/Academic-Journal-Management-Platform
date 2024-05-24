#!/bin/sh

export DB_FILE="sila_dev_db.sql"
export DB_NAME=$1

# export password from .env file
source .env


# Clear out older database if it exists
mysql -u $MYSQL_USER -h $DB_HOST --password=$MYSQL_PWD -e "drop database if exists $DB_NAME; create database $DB_NAME;"
# Import the dev database 
mysql -u $MYSQL_USER -h $DB_HOST --password=$MYSQL_PWD $DB_NAME < $DB_FILE

# Import views to the database
export MYSQL_VIEWS_DIR="views"
find "$MYSQL_VIEWS_DIR" -type f -name "*.sql" | sort | while read -r file; do
    echo "Executing contents of file in db: $file"
    mysql -u $MYSQL_USER -h $DB_HOST --password=$MYSQL_PWD $DB_NAME < "$file"
    echo "$file completed"
done

# Import procedures to the database
export MYSQL_PROCEDURES_DIR="procedures"
find "$MYSQL_PROCEDURES_DIR" -type f -name "*.sql" | sort | while read -r file; do
    echo "Executing contents of file in db: $file"
    mysql -u $MYSQL_USER -h $DB_HOST --password=$MYSQL_PWD $DB_NAME < "$file"
    echo "$file completed"
done

