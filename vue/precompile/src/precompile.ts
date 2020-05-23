import * as fs from "fs"
import { promisify } from "util"
import fm from "front-matter"
// import * as moment from "moment"
//import { FrontMatterResult } from "front-matter"

async function run() {
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
  console.log(fm(content.toString()))
  return content.toString()
}

console.log("Precompiling")
run()