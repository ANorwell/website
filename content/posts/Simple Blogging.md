---
title: "QuickBlog"
date: "2020-06-28"
tags: tutorial, quickblog
---

QuickBlog is a dead simple and easy to use blogging tool. Anyone with a [github](github.com) account can use it to start blogging within minutes. Once a post has been written (in markdown or HTML format), it will be automatically published to a github pages website.


## Setting up

First, sign up for a [github](github.com) account if you don't already have one. Then, fork the [quickblog repository](https://github.com/anorwell/quickblog) by clicking the fork button in the top right. 

You have just created your blog! It will live at [<username>.github.io/quickblog](<username>.github.io/quickblog) (but may not show up until you publish your first post).

### Adding content

To author a post, navigate to the `content/posts` directory in your quickblog project on github and click the add file button in the top right. Every post must contain a front-matter section with a title, date, and optional tags. Following that comes the content of the post, which can be either markdown or HTML. This is easiest to show with an example:

```
---
title: My First Post
date: 2020-06-28
tags: easy, quickblog
---

This is my first post.

## This is a header
### This is a sub-header

More content goes here.
```