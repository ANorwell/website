import * as fs from "fs"
import path from "path"
import { promisify } from "util"
import fm from "front-matter"
import moment, { Moment } from "moment"

let config = {
  // where to place generated posts, relative to outDir
  posts: "content/posts",

  // Where to place the posts manifest file, relative to outDir
  manifestPath: "content/posts.json",

  // The parent directory for precompiled assets
  outDir: "public"
}

class Post {
  constructor(
    public file: string,
    public title: string,
    public date: Moment,
    public tags: string[],
    public content: string) {}

  toSummary() {
    return { path: this.file, title: this.title, tags: this.tags, date: this.date.format() }
  }
}

async function run() {
  let posts = await loadPosts(config.posts)

  for (const p of posts) {
    await writePost(config.outDir, p)
  }
  await writeManifest(`${config.outDir}/${config.manifestPath}`, posts)
}

async function loadPosts(dir: string): Promise<Array<Post>> {
  let files = await promisify(fs.readdir)(dir)
  let out: Post[] = []
  for(let file of files) {
    out.push(await parsePost(dir + "/" + file))
  };
  return out
}

async function writePost(outDir: string, post: Post): Promise<void> {
  let fullPath = `${outDir}/${post.file}`
  let directory = path.dirname(fullPath);
 
  await promisify(fs.mkdir)(directory, { recursive: true })
  await promisify(fs.writeFile)(fullPath, post.content)
}

async function writeManifest(outPath: string, posts: Array<Post>) {
  let index = posts
    .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
    .map(p => p.toSummary())

  await promisify(fs.writeFile)(outPath, JSON.stringify(index))
}

async function parsePost(path: string): Promise<Post> {
  let content = await promisify(fs.readFile)(path)
  let parsed = fm<any>(content.toString())
  let time = moment(parsed.attributes.date)
  let tags = (parsed.attributes || '').tags.split(",").map((s: string) => s.replace(/ /g, ''))
  return new Post(path, parsed.attributes.title, time, tags, parsed.body)
}

console.log("Precompiling")

run().catch((reason) => console.log(reason))