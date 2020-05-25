"use strict";
exports.__esModule = true;
var front_matter_1 = require("front-matter");
console.log("test");
var str = "---\nx: thing\n---\nbody\n";
console.log(front_matter_1["default"](str));
/* import * as fs from "fs"
import { promisify } from "util"
import * as fm from "front-matter"
import * as moment from "moment"
//import { FrontMatterResult } from "front-matter"

console.log("fm", fm)

let str = `
-----
x: thing
-----
body
`;

console.log(fm.default(str)); */
/* async function run() {
  let out = await precompile("content/posts")
  console.log(out)
}

async function precompile(dir: string) {
  let files = await promisify(fs.readdir)(dir)
  let out: string[] = []
  for(let file of files) {
    out.push(await precompileFile(dir + "/" + file))
  };
  return out
}

async function precompileFile(path: string) {
  let content = await promisify(fs.readFile)(path)

  console.log(fm)
  console.log(fm.default(content.toString()))
  return content.toString()
}

console.log("moment is", moment)
//console.log(moment.Moment)

console.log("fm", fm)
console.log("Precompiling")
run() */ 
