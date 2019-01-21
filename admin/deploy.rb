TARGET = '~/www'

FILES = %w[
index.php
style.css
about.html
post.html
projects.html
listen.html
js/
content.py
indexbs.php
]
         
FILES_FULL = %w[
bootstrap/
graphics/
src/
syntaxhighlighter/
ckeditor/
favicon.ico
jplayer.css
xd_receiver.htm

jplayer.blue.monday.jpg
]

FILES.each{|f| %x[cp -r #{f} #{TARGET}] }

if ARGV[0] == '--full'
  FILES_FULL.each{|f| %x[cp -r #{f} #{TARGET}] }
end
