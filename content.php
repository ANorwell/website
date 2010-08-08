#!/usr/bin/python

import MySQLdb

try:
 conn = MySQLdb.connect (
  host = "anorwell.powwebmysql.com",
  user = "darkchrono",
  passwd = "select22",
  db = "arron")

except MySQLdb.Error, e:
 print "Error %d: %s" % (e.args[0], e.args[1])
 sys.exit (1)

print "Content-Type: application/html\n"
print "connected to the database"
