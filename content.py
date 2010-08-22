#!/usr/bin/python

import MySQLdb
import cgi
import json
import datetime
import os
import re
import sys

#Database info
gHost = "anorwell.powwebmysql.com"
gUser = "darkchrono"
gPassword = "select"
gDB = "arron"

gPostTable = "post"
gCommentTable = "comment"

gSongDirectory = 'src/music/'


def connect():
    try:
        conn = MySQLdb.connect (
            host = gHost,
            user = gUser,
            passwd = gPassword,
            db = gDB
        )

    except MySQLdb.Error, e:
        print "Error %d: %s" % (e.args[0], e.args[1])
        sys.exit (1)

    return conn

def processPost():
    form = cgi.FieldStorage();
        
    if ("password" not in form) or (form["password"].value != 'select'):
        print "Status: 400 BAD REQUEST"
        print "Content-Type: text/html\r\n"
        print "Invalid POST: password incorrect"
        return;

    #TODO: sanitize/process content?

    print "Status: 200 OK"
    print "Content-Type: text/html\r\n"

    if ("songdata" in form):  #it is music

        addEntry(
            "music",
            name = form.getfirst("name"),
            filename = form["songdata"].filename,
        )

        uploadSong(form["songdata"].filename, form["songdata"])
        print "Added song " + form.getfirst("name")
    else:
        addEntry(
            "post",
            title = form.getfirst("title"),
            type = form.getfirst("type"),
            content = form.getfirst("content")
        )
        print "Added post " + form.getfirst("title")

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
    print "Running: " + postQuery + " with vals:",args.values(), "<br/>\n"
    cursor.execute(postQuery, args.values() )


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

"""Will return JSON list of :
[ { class:
    named attributes for this class
   },
   { ... }
]

"""    
def processGet():
    query = os.environ["QUERY_STRING"]
    args = {}

    print "Status: 200 OK"
    print "Content-Type: application/json\r\n"

    if query:
        pairs = re.split('\s*[&;]', query)
        args = dict(map( lambda x: re.split('\s*=\s*', x), pairs))


    conn = connect()
    cursor = conn.cursor()

    #Make query to get post(s), based on if id and tag are in query string
    if ("id" in args and re.search('^\d+$', args["id"] ) ):
        filter = "id = " + args["id"]
    elif ("tag" in args and re.search('^\w+$', args["tag"]) ):
        filter = 'type LIKE "' + args["tag"] + '"'
    else:
        filter = "1"

    result = getSingleTableData(
        ['id','title','content','date','type'],
        table = gPostTable,
        cursor = cursor,
        filter = filter,
        max = args["maxposts"] if "maxposts" in args else '5'
        )

    #Get the comments for that post
    #TODO
    #result.append ...

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
          args["max"]
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
