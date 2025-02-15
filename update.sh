#!/bin/bash
HOME=/home/han
. $HOME/.ssh/agent/$HOST
. ~/.keychain/`/bin/hostname`-sh
cd /home/han/Documents/xiaode-backend/
/usr/bin/java -jar /home/han/Documents/xiaode-backend/target/xiaode.jar --json /home/han/Documents/xiaode-backend/database.json --kw /home/han/Documents/xiaode-backend/keywo$
cp /home/han/Documents/xiaode-backend/*.lz /home/han/Documents/hanxiao.github.io/data/
cd /home/han/Documents/hanxiao.github.io/
scp /home/han/Documents/xiaode-backend/thumbnail/*.jpg  xiaoh@lxhalle.informatik.tu-muenchen.de:/u/halle/xiaoh/home_page/html-data/thumbnail/
/usr/bin/git add data/keywords.json
/usr/bin/git add data/*.lz
/usr/bin/git add index.html
/usr/bin/git commit -m"regular update of database `date`"
/usr/bin/git push
