---
title: "QuickBlog"
date: "2020-06-28"
tags: tutorial, projects, website
---

QuickBlog is a dead simple and easy to use blogging tool. Anyone with a [github](github.com) account can use it to start blogging within minutes. Once a post has been written (in markdown or HTML format), it will be automatically published to a github pages website. Unlike blogging platforms like medium or tumblr, you own the content you create [[1]](#footnotes).

### Why not use X?

There are a lot of static site tools, most of which have more features and an established userbase. [Jenkyll](https://jekyllrb.com/) is probably the most popular; [Hugo](https://gohugo.io/) is another. These are very flexible tools that can create all kinds of websites, not just blogs. They have better support for theming and customization. 

But these are also, in my experience, more complicated to get started with. Here's github's [guide to creating a Jenkyll-based site](https://help.github.com/en/github/working-with-github-pages/creating-a-github-pages-site-with-jekyll). It requires use of the command line. It's not obvious how to make to make a blog.

The goal of Quickblog is to make setup and blog hosting as easy as possible. Anyone should be able to start and _host_ their own blog without friction [[2]](#footnotes).

If flexibility or customizability are important to you, you should probably consider other tools.

Quickblog differs from many other static site generators in that it generates a single page application. 

## Setting up

First, sign up for a [github](github.com) account if you don't already have one. Then, fork the [quickblog repository](https://github.com/anorwell/quickblog) by clicking the fork button in the top right. 

You have just created your blog! It will live at [USERNAME.github.io/quickblog](USERNAME.github.io/quickblog) (but may not show up until you publish your first post). You may create a different URL -- see the configuration section below.

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

When the post is done, click the commit button submit the post.

### Customization

In your forked copy of the quickblog repository, you may edit the config.ts file to configure the application. You may edit the `title` that appears at the top of the page as well as the number of posts that appear on a page.

#### Changing the appearance

The appearance can be customized via [CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets). See the stylesheets in the `stylesheets/` directory -- these may be edited to change the appearance.

#### Changing the URL

By renaming your forked copy of the repository from `quickblog` to `USERNAME.github.io`, the site will be published at `USERNAME.github.io` instead of `USERNAME.github.io/quickblog`. 

It's easy to create your own domain name and point it to github pages. See, for example, [this guide](https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain).

### How it works

The quickblog website uses [vue.js](https://vuejs.org/) with an additional precompilation step that transforms the content files (posts, etc.) into HTML plus a manifest file that acts as an index to the content. The website first fetches that manifest, and then fetches the relevant posts based on the current route.

The automatic publishing of the page to github pages is accomplished via a github action.

### Footnotes

[1] While the content is hosted on github by default, both the website and content you create are open source. You can take the website -- or just the content -- and host it where and how you wish. And github's hosting is fundamentally different to a blogging platform like medium: while medium wants to keep your content within its ecosystem to continue to drive users back to its website, github is agnostic to this because quickblog is just an application hosted on top of its repository. Medium hosts your content; Github hosts your _site_.

[2] It would be feasible for a tool like quickblog to use Jenkyll under the hood, thus giving access to their customizability and community. The primary purpose of quickblog was to host my own website, and therefore I wanted to create it from scratch.