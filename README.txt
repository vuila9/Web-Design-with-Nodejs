HOW TO RUN (instruction applies to Windows)

- should be running 3 terminals (cmd)

- one to turn on MongoDB server:
   + in cmd, change current directory to directory where you have MongoDB installed (/MongoDB/Server/<version>/bin/)
   + create a folder call 'db' (or whatever you prefer) anywhere you want.
   + in cmd, type 'mongod --dbpath="path/to/db"

- one to turn on Mongo database:
   + in cmd, change directory to directory where you have MongoDB installed (/MongoDB/Server/<version>/bin/)
   + type "mongo" to enter the database

- one to initialize database / run server:
   + change directory to the one containing 'server.js'
   + type 'node database-initializer.js' to add all data to database server

- to verify all data are added to the database server, go to the terminal where you type 'mongo' (2nd terminal):
   + type "show dbs", you should see 'a4' displayed
   + type "use a4"
   + type "db.users.find()", you should see a part of the users collection displayed, that means the server is
     ready to run

- in the 3rd terminal (the one with directory containing 'server.js'), type 'npm install'
- it will install pug, express,express-session, and mongodb
- type 'node server.js' to run the server
- open any browser, preferably Chrome/Edge, go to URL: http://localhost:3000
- to close the server, press Ctrl-C


HOW TO TEST:
- Navigate each header
- View any user's profile in "Users" tab
- Create new accounts in "Register" tab
- Try to login
- Buy food in "Order Food" tab and submit the order
- Check order by clicking the "View Profile" tab
- Try to copy paste /users/:id or /orders/:id to test for server responses
* to find users using query params, use `/user?name=` instead of `/users?name=`

This zip file includes:
- database-initializer.js
- server.js
- package.json
- README.txt
- public
   ├─js
     ├───home.js
     ├───orderform.js
     ├───register.js
- views
   ├─CSS
     ├───home.css
     ├───orderform.css
   ├─img
     ├───add.png
     ├───remove.png
     ├───gandalf.png
   ├─pug
     ├───header.pug
     ├───home.pug
     ├───orderform.pug
     ├───orderSum.pug
     ├───register.pug
     ├───userList.pug
     ├───userPage.pug
 









