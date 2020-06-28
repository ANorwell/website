# anorwell.com

This is a vue-based static app with an additional precompilation step that places content from the content directory into the public directory, which can then be served by any web-server.

To build:

```
npm install
npm run precompile
npm run build
```

It uses [quickblog](github.com/anorwell/quickblog), which I created.
