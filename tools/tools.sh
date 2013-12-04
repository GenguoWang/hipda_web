#! /bin/bash
BASEDIR=`dirname $0`
cd $BASEDIR
echo "BEGIN: " `date` >> tools.log
php -f handle.php >> tools.log
echo "" >> tools.log
echo "" >> tools.log
echo "" >> tools.log
