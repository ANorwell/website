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

gConfigFileLocation = "/www/config.txt"

def getConfig(file):
    f = open(file)
    lines = filter(
        lambda x: not re.match("(^$)|#|\s",x),
        re.split('\n', f.read()))
    for l in lines:
        sys.stderr.write(l + "\n")
    
    config = dict( map( lambda x: re.split('\s*=\s*',x), lines))

    sys.stderr.write("Config:")
    for k,v in config.iteritems():
        sys.stderr.write("k: "+ k + " v: " + v),
    return config


"""Connect to the DB"""
def connect(config):
    try:
        conn = MySQLdb.connect (
            host = config['host'],
            user = config['user'],
            passwd = config['dbPw'],
            db = config["db"]
        )

    except MySQLdb.Error, e:
        print "Error %d: %s" % (e.args[0], e.args[1])
        sys.exit (1)

    return conn


def checkPw(form, expected_pw):
    sys.stderr.write("form pw is: " + form['password'].value)
    sha = hashlib.sha224(form["password"].value).hexdigest()
    sys.stderr.write( "shas to " + sha)
    sys.stderr.write(" and expected is " + expected_pw)
    if ("password" not in form) or ( hashlib.sha224(form["password"].value).hexdigest() != expected_pw):
        return False;
    return True;



"""
Form requires fields password, and then either:
songdata, name    OR
title,type,content
"""
def processPost(environ, start_response, config):
    form = cgi.FieldStorage(environ['wsgi.input'],
                            environ=environ);
    
    status = '200 OK'
    response_headers = [('Content-Type','text/html')]

    #determine the type of the data in the post
    validated = False
    if "graph" not in form:
        validated = checkPw(form, config['postPwSha'])
        if not validated:
            status = '400 BAD REQUEST'
            start_response(status, response_headers)
            return ["Invalid POST: password incorrect"]

    conn = connect(config)
    cursor = conn.cursor()

    if "graph" in form:
        id = addEntry( cursor,
            config['graphTable'],
            graph = form.getfirst("graph")
            )
        content = str(id)
    elif validated and "songdata" in form:
        print addEntry(cursor,
            config['songTable'],
            name = form.getfirst("name"),
            filename = form["songdata"].filename
        )
        filepath = config['songDirectory'] + form["songdata"].filename
        uploadSong(filepath, form["songdata"])
        content =  "Added song " + form.getfirst("name")

    elif validated: #it is a content post
        print addEntry(cursor,
            config['postTable'],
            title = form.getfirst("title"),
            type = form.getfirst("type"),
            content = form.getfirst("content")
        )
        content =  "Added post " + form.getfirst("title")

    start_response(status, response_headers)
    return [content]


#Given a table name and a dict of name=data,
#inserts that data into the table
def addEntry(cursor, table, **args):
    

    nameString = '(date,' + ','.join(args.iterkeys()) + ')';

    valueString = 'VALUES (NOW()'
    for k in args.keys():
        valueString = valueString + ', %s'
    valueString = valueString + ')'

    postQuery = " ".join(
        [ 'INSERT INTO',
          table,
          nameString,
          valueString,
          ]
        )


    """    
    postQuery = " ".join(
        [ 'INSERT INTO',
          table,
          '(title,content,content2,content3,date,type)',
          'VALUES (%s, %s, %s, %s, NOW(), %s)'
          ]
        )
    """
    cursor.execute(postQuery, args.values() )

    #Get and return the id of the inserted object
    cursor.execute("SELECT LAST_INSERT_ID()")
    val = cursor.fetchone()[0]
    return val



def uploadSong(filepath, filePost):
    print "Trying to create", filepath, "<br>\n"
    if os.path.isfile(filepath):
        print "File", filepath, "already exists\n"
        return 0
    out = open(filepath, 'w');
    for line in filePost.file:
        out.write(line)

    return 1

"""A GET request for information that returns JSON.
The following params are supported:
  type = music|post|graph
  id = the id number of the post/song (ie, get only 1)
  tag = only valid for posts, describes a tag that the post is tagged with.
  
Will return JSON list of : 
[ { class:
    named attributes for this class
   },
   { ... }
]

"""    
def processGet(environ, start_response, config):
    query = environ["QUERY_STRING"]
    args = {}

    response_headers = [('Content-Type:', 'application/json\r\n')]

    if query:
        pairs = re.split('\s*[&;]', query)
        args = dict(map( lambda x: re.split('\s*=\s*', x), pairs))
    else:
        args = dict()


    conn = connect(config)
    cursor = conn.cursor()

    if ("type" in args and args["type"] == "music"):
        tableName = config['songTable']
        columns =  ['id','name','filename', 'date']
        args["maxposts"] = "100"
    elif ("type" in args and args["type"] == "graph"):
        tableName = config['graphTable']
        columns = ['id', 'graph', 'date']
    else:
        tableName = config['postTable']
        if "title" in args:
            columns = ['id', 'title']
        else:
            columns =  ['id','title','content','date','type']
    

    #Make query to get post(s), based on if id and tag are in query string
    #enforce format to avoid sql injection
    if ("id" in args and re.search('^\d+$', args["id"] ) ):
        filter = "id = " + args["id"]
    elif ("tag" in args and re.search('^\w+$', args["tag"]) ):
        filter = 'type LIKE "' + "%" + args["tag"] + "%" + '"'
    else:
        filter = "1"

    result = getSingleTableData(
        columns,
        table = tableName,
        cursor = cursor,
        filter = filter,
        first = args["first"] if "first" in args else '0',
        max = args["maxposts"] if "maxposts" in args else '5'
        )

    #return the response
    start_response('200 OK', response_headers);
    return [json.dumps(result)];

"""
Perform a single query with a WHERE and an order
Returns a list of dicts representing each item
"""
def getSingleTableData(rownames, **args):
    cursor = args["cursor"]
    getQuery = " ".join(
        [ 'SELECT',
          ",".join(rownames),
          'FROM',
          args["table"],
          'WHERE',
          args["filter"],
          'ORDER BY id',
          args["order"] if "order" in args else 'DESC', #most recent first default
          'LIMIT',
          args["first"], ",", args["max"]
          ]
        )

    sys.stderr.write("Query is: " + getQuery + "\n");
    
    cursor.execute(getQuery )

    def processRow(row):
        return dict(zip(rownames,
                        map(lambda x: x.isoformat() if isinstance(x, datetime.datetime) else x, row)))

    #return a dict for each entry.
    return map(processRow, cursor.fetchall() )


##Handle a request##

def application(environ, start_response):
    config = getConfig(gConfigFileLocation)


    if (environ["REQUEST_METHOD"] == 'POST'):
        sys.stderr.write("handling a POST request at" + datetime.datetime.now().ctime() + "\n")
        return processPost(environ, start_response, config)
    else:
        sys.stderr.write("handling a GET request at" + datetime.datetime.now().ctime() + "\n")
        return processGet(environ, start_response, config)
