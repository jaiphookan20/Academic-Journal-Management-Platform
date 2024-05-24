#!/bin/sh

export DB_NAME=$1
export DB_FILE="sila_dev_db.sql"


# export password from .env file
source .env

#exclude views during snpashot
SQL_STRING='show tables like "VW_%"'
VIEWS=$(echo $SQL_STRING | mysql -u $MYSQL_USER --password=$MYSQL_PWD $DB_NAME | tail -n +2)

IGNORE_VIEWS=""

for view in $VIEWS; do
    IGNORE_VIEWS=$IGNORE_VIEWS" --ignore-table="$DB_NAME"."$view
done

mysqldump -u $MYSQL_USER --password=$MYSQL_PWD $DB_NAME$IGNORE_VIEWS > $DB_FILE

