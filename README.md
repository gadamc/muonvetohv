# cryostat app

This displays the measured high voltage values of the Muon Veto HV

To upload this app to a database call:

couchapp push 'http://<admin>:<password>@<yourCouchDBAddress>/<database>'

For example:
couchapp push 'http://admin:darkmatter@127.0.0.1:5984/automat'

or 

couchapp push 'http://edelweiss:******@edelweiss.cloudant.com/automat'


To configure the application display and behavior, modify the files:

    _attachments/index.html
    _attachments/script.js
    
To add a new view add a new directory under views.  The view name will be the name of the directory (ala myViews) and then you can simply write map.js (and reduce.js if required) in that directory.
