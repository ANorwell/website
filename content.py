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
    if ( "title" not in form)  or ( "content" not in form):
        print "Status: 400 BAD REQUEST"
        print "Content-Type: text/html\r\n"
        print "Invalid POST: title or content missing"
        return;
        
    if ("password" not in form) or (form["password"] != 'select'):
        print "Status: 400 BAD REQUEST"
        print "Content-Type: text/html\r\n"
        print "Invalid POST: password incorrect"
        return;



    #TODO: sanitize/process content?

    print "Status: 200 OK"
    print "Content-Type: text/html\r\n"
        
    addEntry(
        table = "post",
        title = form.getfirst("title"),
        type = form.getfirst("type"),
        content = form.getfirst("content")
    )

def addEntry(**args):
    
    conn = connect()
    cursor = conn.cursor()
    postQuery = " ".join(
        [ 'INSERT INTO',
          args["table"],
          '(title,content,content2,content3,date,type)',
          'VALUES (%s, %s, %s, %s, NOW(), %s)'
          ]
        )
    cursor.execute(postQuery, (args["title"],
                               args["content"],
                               args["content2"] if "content2" in args else '',
                               args["content3"] if "content3" in args else '',
                               args["type"])
                               )
    print "Ran addEntry"

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
