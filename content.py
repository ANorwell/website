#!/usr/bin/python

import MySQLdb
import cgi
import json
import datetime
import os
import re

#Database info
gHost = "anorwell.powwebmysql.com"
gUser = "darkchrono"
gPassword = "select"
gDB = "arron"

gPostTable = "post"
gCommentTable = "comment"

print "Content-Type: text/html\n\n"

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
        return "Invalid POST: title or content missing"
        
    addEntry(
        table = "post",
        title = form.getfirst("title"),
        type = form.getfirst("type"),
        content = form.getfirst("content")
    )
    return "Post Added"

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

def processGet():
    query = os.environ["QUERY_STRING"]
    params = {}

    if query:
        pairs = re.split('\s*[&;]', query)
        params = dict(map( lambda x: re.split('\s*=\s*', x), pairs))

    if ("id" in params):
        getData(id = params["id"],
            maxposts = params["maxposts"] if "maxposts" in params else str(5)
            )
    else:
        getData(maxposts = params["maxposts"] if "maxposts" in params else str(5))
            

"""Will return JSON list of :
[ { class:
    named attributes for this class
   },
   { ... }
]

"""    
def getData(**args):
    conn = connect()
    cursor = conn.cursor()

    #Get the post itself
    if ("id" in args):
        filter = "id = %s"
        filterargs = args["id"]
    else:
        filter = "%s"
        filterargs = "1"
    result = getSingleTableData(
        ['id','title','content','date','type'],
        table = gPostTable,
        cursor = cursor,
        filter = filter,
        filterargs = filterargs,
        max = args["maxposts"]
        )

    #Get the comments for that post
    #TODO
    #result.append ...


    #Return the json data
    print json.dumps(result);

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
    cursor.execute(getQuery, args["filterargs"] )

    def processRow(row):
        return dict(zip(rownames,
                        map(lambda x: x.ctime() if isinstance(x, datetime.datetime) else x, row)))

    #return a dict for each entry. also, sanitize
    return map(processRow, cursor.fetchall() )


if (os.environ["REQUEST_METHOD"] == 'POST'):
    processPost()
else:
    processGet()
