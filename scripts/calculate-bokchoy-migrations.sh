#!/usr/bin/env bash

############################################################################
#
#   reset-test-db.sh
#
#   Resets the MySQL test database for the bok-choy acceptance tests.
#
#   If it finds a cached schema and migration history, it will start
#   from the cached version to speed up migrations.
#
#   If no cached database exists, it will create one.  This can be
#   checked into the repo to speed up future tests.
#
#   Note that we do NOT want to re-use the cache between test runs!
#   A newer commit could introduce migrations that do not exist
#   in other commits, which could cause migrations to fail in the other
#   commits.
#
#   For this reason, we always use a cache that was committed to master
#   at the time the branch was created.
#
############################################################################

# Fail fast
set -e

DB_CACHE_DIR="common/test/db_cache"

if [[ -z "$BOK_CHOY_HOSTNAME" ]]; then
    MYSQL_HOST=""
    SETTINGS="bok_choy"
else
    MYSQL_HOST="--host=edx.devstack.mysql"
    SETTINGS="bok_choy_docker"
fi

declare -A databases
declare -a database_order
databases=(["default"]="edxtest" ["student_module_history"]="student_module_history_test")
database_order=("default" "student_module_history")

# Ensure the test database exists.
for db in "${database_order[@]}"; do
    echo "CREATE DATABASE IF NOT EXISTS ${databases[$db]};" | mysql $MYSQL_HOST -u root

    # Clear out the test database
    #
    # We are using the reset_db command which uses "DROP DATABASE" and
    # "CREATE DATABASE" in case the tests are being run in an environment (e.g. devstack
    # or a jenkins worker environment) that already ran tests on another commit that had
    # different migrations that created, dropped, or altered tables.
    echo "Clearing out the $db bok_choy MySQL database."
    # ./manage.py lms --settings $SETTINGS reset_db --traceback --router $db
    echo "Calculating migrations."
    output_file="${db}_showmigrations.yaml"
    # ./manage.py lms --settings $SETTINGS show_unapplied_migrations --database $db --output_file $output_file
    ./manage.py lms --settings $SETTINGS showmigrations --database $db > $output_file
done


