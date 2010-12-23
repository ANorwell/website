#!/usr/bin/python

import MySQLdb
import cgi
import json
import datetime
import os
import re
import sys
import base64
import hashlib

"""
Handles POSTs in processPost, which submit either a post or a song (or TODO: comments),
or GETS in processGet, which request either posts or songs (or TODO: comments).
"""

#Database info
gHost = "anorwell.powwebmysql.com"
gUser = "darkchrono"
gDB = "arron"
gDbPw = base64.b64decode('c2VsZWN0')


#names of db tables
gPostTable = "post"
gSongTable = "music"
gGraphTable = "graph"

gSongDirectory = 'src/music/'

#this is sha224(sha224(pw)).
#both client and server encrypt, so that pw not vulnerable over the wire
gPostPwSha = '36459f6c0c81826f7a828fcee17c247580fcab9afef89ee6972008f6'
#'37407adc4230292f12303ce9ec0e4b029c3bb1f6ad323a6fe2d6388c'

"""Connect to the DB"""
def connect():
    try:
        conn = MySQLdb.connect (
            host = gHost,
            user = gUser,
            passwd = gDbPw,
            db = gDB
        )

    except MySQLdb.Error, e:
        print "Error %d: %s" % (e.args[0], e.args[1])
        sys.exit (1)

    return conn


def checkPw(form):
    if ("password" not in form) or ( hashlib.sha224(form["password"].value).hexdigest() != gPostPwSha):
        return False;
    return True;



"""
Form requires fields password, and then either:
songdata, name    OR
title,type,content
"""
def processPost():
    form = cgi.FieldStorage();


    #determine the type of the data in the post
    validated = False
    if "graph" not in form:
        validated = checkPw(form)
        if not validated:
            print "Status: 400 BAD REQUEST"
            print "Content-Type: text/html\r\n"
            print "Invalid POST: password incorrect"
            return


    print "Status: 200 OK"
    print "Content-Type: text/html\r\n"


    if "graph" in form:
        id = addEntry(
            gGraphTable,
            graph = form.getfirst("graph")
            )
        print str(id)
    elif validated and "songdata" in form:
        print addEntry(
            gSongTable,
            name = form.getfirst("name"),
            filename = form["songdata"].filename,
        )

        uploadSong(form["songdata"].filename, form["songdata"])
        print "Added song " + form.getfirst("name")

    elif validated: #it is a content post
        print addEntry(
            gPostTable,
            title = form.getfirst("title"),
            type = form.getfirst("type"),
            content = form.getfirst("content")
        )
        print "Added post " + form.getfirst("title")


#Given a table name and a dict of name=data,
#inserts that data into the table
def addEntry(table, **args):
    
    conn = connect()
    cursor = conn.cursor()

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



def uploadSong(name, filePost):
    filepath = gSongDirectory + name
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
def processGet():
    query = os.environ["QUERY_STRING"]
    args = {}

    print "Content-Type: application/json\r\n"
    print ""

    if query:
        pairs = re.split('\s*[&;]', query)
        args = dict(map( lambda x: re.split('\s*=\s*', x), pairs))
    else:
        args = dict()


    conn = connect()
    cursor = conn.cursor()

    if ("type" in args and args["type"] == "music"):
        tableName = gSongTable
        columns =  ['id','name','filename', 'date']
        args["maxposts"] = "100"
    elif ("type" in args and args["type"] == "graph"):
        tableName = gGraphTable
        columns = ['id', 'graph', 'date']
    else:
        tableName = gPostTable
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

    print json.dumps(result);

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



if (os.environ["REQUEST_METHOD"] == 'POST'):
    sys.stderr.write("handling a POST request at" + datetime.datetime.now().ctime() + "\n")
    processPost()
else:
    sys.stderr.write("handling a GET request at" + datetime.datetime.now().ctime() + "\n")
    processGet()
