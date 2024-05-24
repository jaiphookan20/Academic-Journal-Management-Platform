#!/bin/sh

source .env

export MYSQL_VIEWS_DIR="views"
find "$MYSQL_VIEWS_DIR" -type f -name "*.sql" | sort | while read -r file; do
    echo "Executing contents of file in db: $file"
    mysql -u $MYSQL_USER -h $DB_HOST --password=$MYSQL_PWD $DB_NAME < "$file"
    echo "$file completed"
done

