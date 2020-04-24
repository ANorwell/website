#!/usr/bin/python
"""
Handles POSTs in processPost, which submit either a post or a song (or TODO: comments),
or GETS in processGet, which request either posts or songs (or TODO: comments).
"""

import MySQLdb
import cgi
import json
import datetime
import os
import re
import sys
import base64
import hashlib

log_enabled = True
def log(message):
    if log_enabled:
        sys.stderr.write("[LOG: " + message + "]\n")

class Data:
    dbConn = False
    validation_needed = True
    def __init__(self,config):
        self.config = config
        #The database fields of this type of data, defined in the subclass
        self.fields = [] 
        #The list of data entries contained in this object
        self.entries = []
    def getConn(self):
        if not self.dbConn:
            try:
                self.dbConn = MySQLdb.connect (
                    host = self.config['host'],
                    user = self.config['user'],
                    passwd = self.config['dbPw'],
                    db = self.config["db"]
                    )
            except MySQLdb.Error, e:
                print "Error %d: %s" % (e.args[0], e.args[1])
                sys.exit (1)
        return self.dbConn

    def loadFromForm(self,form):
        entry = {}
        for k in self.fields:
            if k in form:
                entry[k] = form.getfirst(k)
            else:
                log("Couldn't find " + k + " in form!")
                return False

        if "id" in form:
            entry["id"] = form.getfirst("id")
        self.entries.append(entry)
        return True

    def create(self):
        for entry in self.entries:
            nameString = '(date,' + ','.join(self.fields) + ')';
            valueString = 'VALUES (NOW()'
            valueList = []
            for k in self.fields:
                valueString = valueString + ', %s'
                valueList.append(entry[k])
            valueString = valueString + ')'
            query = " ".join(
                [ 'INSERT INTO',
                  self.table,
                  nameString,
                  valueString,
                  ]
                )

            log("Creating: " + query)
            log(str(entry))

            cursor = self.getConn().cursor()
            cursor.execute(query, valueList)
            cursor.execute("SELECT LAST_INSERT_ID()")
            val = cursor.fetchone()[0]
            entry["id"] = val
        return True
    def load(self, args):
        #the filter to apply to the table
        if "id" in args and args["id"].isdigit():
            filter = "id = " + args["id"]
        elif "tag" in args and re.search('^\w+$', args["tag"]):
            filter = 'type LIKE "' + "%" + args["tag"] + "%" + '"'
        else:
            filter = "1"

        rownames = ['id','date'] + self.fields
        if "first" in args and args["first"].isdigit():
            first = args["first"]
        else:
            first = '0'
        if "maxposts" in args and args["maxposts"].isdigit():
            maxposts = args["maxposts"]
        else:
            maxposts = '5'
        
        getQuery = " ".join(
             [ 'SELECT',
              ",".join(rownames),
              'FROM',
              self.table,
              'WHERE',
              filter,
              'ORDER BY id',
              args["order"] if "order" in args else 'DESC', #most recent first default
              'LIMIT',
              first, ",", maxposts
               ])
        log("Performing GET query: " + getQuery)
        cursor = self.getConn().cursor()
        cursor.execute(getQuery)

        def processRow(row):
            entry = dict(zip(rownames,
                     map(lambda x: x.isoformat() if isinstance(x, datetime.datetime) else x, row)))
            log("Loaded entry: " + str(entry))
            self.entries.append(entry)

        map(processRow, cursor.fetchall() )

    def update(self):
        for ent in self.entries:
            if 'id' in ent:
                setStr = ", ".join( map( lambda x: x + '=%s', self.fields ) )
                values = map( lambda k: ent[k], self.fields )
                query = " ".join([
                    'UPDATE',
                    self.table,
                    'SET',
                    setStr,
                    ('WHERE id='+ent['id'])
                    ])
                log("Running UPDATE query: " + query)
                log(str(values))
                self.getConn().cursor().execute(query,values)
            else:
                log("unable to update an entry with no id!")

        
    def toJSON(self):
        return json.dumps(self.entries)

    #a json summary of the data. By default, returns same as toJSON
    def toJSONShort(self):
        return self.toJSON()
    def setId(self,id):
        if len(self.entries) != 1:
            log("Unable to set id for a Data object that doesn't have exactly 1 entry!")
            return False
        self.entries[0]["id"] = id
        return True
        
class Post(Data):
    def __init__(self, config):
        Data.__init__(self, config)
        self.table = config['postTable']
        self.fields = ['title', 'type', 'content' ]
    def toJSONShort(self):
        short_entries = []
        for entry in self.entries:
            short_entries.append({ 'id': entry['id'],
                                   'title': entry['title'] })
        return json.dumps(short_entries)

class Graph(Data):
    validation_needed = False
    def __init__(self, config):
        Data.__init__(self, config)
        self.table = config['graphTable']
        self.fields = ['graph']
class Song(Data):
    def __init__(self, config):
        Data.__init__(self, config)
        self.table = config['songTable']
        self.fields = ['name',  'filename']
        #TODO: create should upload the Song

    def loadFromForm(self, form):
        entry = { 'name': form.getfirst('name'),
                  'filename': form['songdata'].filename,
                  'file': form['songdata'].file }
        self.entries.append(entry)
        return True

    def create(self):
        Data.create(self)
        for entry in self.entries:
            filepath = self.config['songDirectory'] + entry['filename']
            log("Uploading file: " + filepath)
            if os.path.isfile(filepath):
                log("File", filepath, "already exists")
                return False
            out = open(filepath, 'w');
            for line in entry['']:
                out.write(line)

class Handler:
    def __init__(self, config_location):
        f = open(config_location)
        lines = filter(
            lambda x: not re.match("(^$)|#|\s",x),
            re.split('\n', f.read()))
        for l in lines:
            log(l + "\n")
    
        config = dict( map( lambda x: re.split('\s*=\s*',x), lines))

        log("Config:")
        conf_str = ""
        for k,v in config.iteritems():
            conf_str += " k: "+ k + " v: " + v + "\n"
        log(conf_str)
        self.config = config

    def handle_request(self, environ, start_response):
        self.environ = environ
        self.start_response = start_response

        #get the query arguments
        query = environ["QUERY_STRING"]
        if query:
            param_pairs = re.split('\s*[&;]', query)
            pairs = map( lambda x: re.split('\s*=\s*', x), param_pairs)
            for pair in pairs:
                if len(pair) != 2:
                    log("Query string: " + query + "does not seem valid!")
                    self.args = dict()
                    break
                self.args = dict(pairs)
        else:
            self.args = dict()
        
        if (environ["REQUEST_METHOD"] == 'POST'):
            log("handling a POST request at" +
                         datetime.datetime.now().ctime() + "\n")
            return self.processPost()
        elif (environ["REQUEST_METHOD"] == 'PUT'):
            log("handling a PUT request at" +
                         datetime.datetime.now().ctime() + "\n")
            return self.processPut()

        else:
            log("handling a GET request at" +
                         datetime.datetime.now().ctime() + "\n")
            return self.processGet()

    def validate(self, form):
        expected_pw = self.config['postPwSha']
        log("form pw is: " + form['password'].value)
        sha = hashlib.sha224(form["password"].value).hexdigest()
        log( "shas to " + sha)
        log(" and expected is " + expected_pw)
        if ("password" not in form) or ( hashlib.sha224(form["password"].value).hexdigest() != expected_pw):
            return False;
        return True;

    def processPost(self):
        form = cgi.FieldStorage(self.environ['wsgi.input'],
                                environ=self.environ);
        if 'graph' in form:
            data = Graph(self.config)
        elif 'songdata' in form:
            data = Song(self.config)
        else:
            log("Creating a Post object")
            data = Post(self.config)
        if not data.loadFromForm(form):
            log("Couldn't load form data!")
            return self.response("400 BAD REQUEST",
                                 "Unable to create. Probably a field missing")
        validated = True
        if data.validation_needed:
            log("Validating the request")
            validated = self.validate(form)
        if not validated:
            log("Request validation failed")
            return self.response("400 BAD REQUEST",
                                 "Password needed!")

        if 'id' in form:
            id = form.getfirst('id')
            if id.isdigit(): #edit id
                #data.setId(id)
                data.update()
                return self.response("200 OK", "Updated entry: " +
                                     str(data.toJSON()))
        #create: no id or id=='none'
        data.create()
        return self.response("200 OK", "Created entry: " + str(data.toJSON()))

    def processGet(self):
        log("Processing GET with args:")
        log(str(self.args))
        
        if "type" in self.args and self.args["type"] == "music":
            data = Song(self.config)
        elif "type" in self.args and self.args["type"] == "graph":
            data = Graph(self.config)
        else:
            data = Post(self.config)

        data.load(self.args)
        if 'title' in self.args and self.args['title'] == '1':
            log("Returning short form of data")
            json = data.toJSONShort()
        else:
            json = data.toJSON()
        return self.response('200 OK', json, json=True)

    def processPut(self):
        log("PUT Not implemented!")

    def response(self, status, string, **args):
        if 'json' in args and args['json']:
            response_headers = [('Content-Type:', 'application/json\r\n')]
        else:
            response_headers = [('Content-Type','text/html')]
        self.start_response(status, response_headers)
        return [string]


def application(environ, start_response):
    config_loc = "/etc/anorwell.conf"
    h = Handler(config_loc)
    return h.handle_request(environ, start_response)
