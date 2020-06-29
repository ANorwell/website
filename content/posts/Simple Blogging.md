<p><a href="https://github.com/anorwell/quickblog">QuickBlog</a> is a dead simple and easy to use blogging tool. Anyone with a <a href="https://github.com">github</a> account can use it to start blogging within minutes. Once a post has been written (in markdown or HTML format), it will be automatically published to a github pages website. Unlike blogging platforms like medium or tumblr, you own the content you create <a href="#footnotes">[1]</a>.</p>
<h3 id="why-not-use-x">Why not use X?</h3>
<p>There are a lot of static site tools, most of which have more features and an established userbase. <a href="https://jekyllrb.com/">Jenkyll</a> is probably the most popular; <a href="https://gohugo.io/">Hugo</a> is another. These are very flexible tools that can create all kinds of websites, not just blogs. They have better support for theming and customization. </p>
<p>But these are also, in my experience, more complicated to get started with. Here&#39;s github&#39;s <a href="https://help.github.com/en/github/working-with-github-pages/creating-a-github-pages-site-with-jekyll">guide to creating a Jenkyll-based site</a>. It requires use of the command line. It&#39;s not obvious how to make to make a blog.</p>
<p>The goal of Quickblog is to make setup and blog hosting as easy as possible. Anyone should be able to start and <em>host</em> their own blog without friction <a href="#footnotes">[2]</a>.</p>
<p>If flexibility or customizability are important to you, you should probably consider other tools.</p>
<p>Quickblog differs from many other static site generators in that it generates a single page application. </p>
<h2 id="setting-up">Setting up</h2>
<p>First, sign up for a <a href="https://github.com">github</a> account if you don&#39;t already have one. Then, fork the <a href="https://github.com/anorwell/quickblog">quickblog repository</a> by clicking the fork button in the top right.</p>
<p>Now, you need to enable github pages for the repository you have created. To do this, click on settings and scroll down to the &quot;Github Pages&quot; section. Under source, re-select <code>gh-pages branch</code>. This will already be selected, but you need to re-select it to actually enable the feature.</p>
<p>You have just created your blog! It will live at <a href="https://USERNAME.github.io/quickblog">USERNAME.github.io/quickblog</a> (but may not show up until you publish your first post). You may create a different URL -- see the configuration section below.</p>
<h3 id="adding-content">Adding content</h3>
<p>To author a post, navigate to the <code>content/posts</code> directory in your quickblog project on github and click the add file button in the top right. Every post must contain a front-matter section with a title, date, and optional tags. Following that comes the content of the post, which can be either markdown or HTML. This is easiest to show with an example:</p>
<pre><code>---
title: My First Post
date: 2020-06-28
tags: easy, quickblog
---

This is my first post.

## This is a header
### This is a sub-header

More content goes here.</code></pre>
<p>When the post is done, click the commit button submit the post.</p>
<h3 id="customization">Customization</h3>
<p>In your forked copy of the quickblog repository, you may edit the config.ts file to configure the application. You may edit the <code>title</code> that appears at the top of the page as well as the number of posts that appear on a page.</p>
<h4 id="changing-the-appearance">Changing the appearance</h4>
<p>The appearance can be customized via <a href="https://en.wikipedia.org/wiki/Cascading_Style_Sheets">CSS</a>. See the stylesheets in the <code>stylesheets/</code> directory -- these may be edited to change the appearance.</p>
<h4 id="changing-the-url">Changing the URL</h4>
<p>By renaming your forked copy of the repository from <code>quickblog</code> to <code>USERNAME.github.io</code>, the site will be published at <code>USERNAME.github.io</code> instead of <code>USERNAME.github.io/quickblog</code>. </p>
<p>It&#39;s easy to create your own domain name and point it to github pages. See, for example, <a href="https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain">this guide</a>.</p>
<h3 id="how-it-works">How it works</h3>
<p>The quickblog website uses <a href="https://vuejs.org/">vue.js</a> with an additional precompilation step that transforms the content files (posts, etc.) into HTML plus a manifest file that acts as an index to the content. The website first fetches that manifest, and then fetches the relevant posts based on the current route.</p>
<p>The automatic publishing of the page to github pages is accomplished via a github action.</p>
<h3 id="footnotes">Footnotes</h3>
<p>[1] While the content is hosted on github by default, both the website and content you create are open source. You can take the website -- or just the content -- and host it where and how you wish. And github&#39;s hosting is fundamentally different to a blogging platform like medium: while medium wants to keep your content within its ecosystem to continue to drive users back to its website, github is agnostic to this because quickblog is just an application hosted on top of its repository. Medium hosts your content; Github hosts your <em>site</em>.</p>
<p>[2] It would be feasible for a tool like quickblog to use Jenkyll under the hood, thus giving access to their customizability and community. The primary purpose of quickblog was to host my own website, and therefore I wanted to create it from scratch.</p>
