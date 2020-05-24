import * as fs from "fs"
import path from "path"
import { promisify } from "util"
import fm from "front-matter"
import moment, { Moment } from "moment"

let config = {
  posts: "content/posts",
  outDir: "dist"
}

class Post {
  constructor(public file: string, public title: string, public date: Moment, public content: string) {}

  toSummary() {
    return { file: this.file, title: this.title, date: this.date.format() }
  }
}

async function run() {
  let posts = await loadPosts(config.posts)
  posts.forEach(async p => await writePost(config.outDir, p))
  await writePostIndex(config.outDir, posts)
}

async function loadPosts(dir: string): Promise<Array<Post>> {
  let files = await promisify(fs.readdir)(dir)
  let out: Post[] = []
  for(let file of files) {
    out.push(await precompileFile(dir + "/" + file))
  };
  return out
}

async function writePost(outDir: string, post: Post): Promise<void> {
  let fullPath = `${outDir}/${post.file}`
  let directory = path.dirname(fullPath);
 
  await promisify(fs.mkdir)(directory, { recursive: true })
  await promisify(fs.writeFile)(fullPath, post.content)
}

async function writePostIndex(outDir: string, posts: Array<Post>) {
  let index = posts
    .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
    .map(p => p.toSummary())

  await promisify(fs.writeFile)(`${outDir}/posts.json`, JSON.stringify(index))
}

async function precompileFile(path: string): Promise<Post> {
  let content = await promisify(fs.readFile)(path)
  let parsed = fm<any>(content.toString())
  let time = moment(parsed.attributes.date)
  return new Post(path, parsed.attributes.title, time, parsed.body)
}

console.log("Precompiling")
run()