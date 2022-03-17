#!/bin/bash

# Remove all migrations and load database with music data from the csv file

rm -f db.sqlite3 spotify2_app/migrations/0*.py spotify2_app/migrations/__pycache__/0*.pyc
python manage.py makemigrations && python manage.py migrate
python manage.py makemigrations spotify2_app && python manage.py migrate spotify2_app
# python manage.py migrate spotify2_app zero && python manage.py makemigrations && python manage.py migrate


# Now load music data from the csv file into Django's database

# WINDOWS: remove the # at the beginning of the line below
./sqlite3 db.sqlite3 -cmd ".mode csv" ".import tracks_features.csv spotify2_app_musicdata"
./sqlite3 db.sqlite3 -cmd ".mode csv" ".import artists.csv spotify2_app_artistdata"

# MAC:remove the # at the beginning of the line below
#sqlite3 db.sqlite3 -cmd ".mode csv" ".import data.csv musicdata"

echo "*********************************************"
echo "If needed, now create super user and insert data into database"

# Windows: Remove the # at the beginning of the line below
#$SHELL
