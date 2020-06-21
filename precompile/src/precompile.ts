import * as fs from "fs"
import path from "path"
import { promisify } from "util"
import fm from "front-matter"
import moment, { Moment } from "moment"

class Config {
  constructor(
    /**
     * The parent directory in which the content lives.
     * This directory should be of the form:
     * <sourceDir>/<contentType>/<contentFile>
     * For example, <sourceDir>/posts/MyPost.html
     */
    public sourceDir: string,

    /**
     * The output directory where precompiled content will be placed.
     */
    public targetDir: string

  ) { }

  sourceContentDir(contentType: string) {
    return this.sourceDir + "/" + contentType
  }

  targetContentDir(contentType: string) {
    return this.targetDir + "/" + contentType
  }  
}

class Post {
  constructor(
    public file: string,
    public title: string,
    public date: Moment,
    public tags: string[],
    public content: string) { }

  toSummary() {
    return { path: this.file, title: this.title, tags: this.tags, date: this.date.format() }
  }
}

class Precompiler {
  constructor(public config: Config) { }

  async run() {
    let contentTypes = await promisify(fs.readdir)(config.sourceDir)
    for (const contentType of contentTypes) {
      await this.precompileContentType(contentType)
    }
  }

  async precompileContentType(contentType: string) {
    let contents = await this.loadContents(contentType)
    for (const p of contents) {
      await this.writeContent(contentType, p)
    }
    await this.writeManifest(contentType, contents)
  }

  async loadContents(contentType: string): Promise<Array<Post>> {
    let files = await promisify(fs.readdir)(config.sourceContentDir(contentType))
    let out: Post[] = []
    for (let file of files) {
      out.push(await this.parseContent(config.sourceContentDir(contentType) + "/" + file))
    };
    return out
  }

  async writeContent(contentType: string, post: Post): Promise<void> {
    let fullPath = `${config.targetContentDir(contentType)}/${post.file}`
    let directory = path.dirname(fullPath);

    await promisify(fs.mkdir)(directory, { recursive: true })
    await promisify(fs.writeFile)(fullPath, post.content)
  }

  async writeManifest(contentType: string, posts: Array<Post>) {
    let index = posts
      .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
      .map(p => p.toSummary())

    let outPath = `${config.targetDir}/${contentType}.json`

    await promisify(fs.writeFile)(outPath, JSON.stringify(index))
  }

  async parseContent(path: string): Promise<Post> {
    let content = await promisify(fs.readFile)(path)
    let parsed = fm<any>(content.toString())
    let time = moment(parsed.attributes.date)
    let tags = (parsed.attributes.tags || '').split(",").map((s: string) => s.replace(/ /g, ''))
    return new Post(path, parsed.attributes.title, time, tags, parsed.body)
  }
}

console.log("Precompiling")

let config = new Config("content", "public/content");

new Precompiler(config).run().catch((reason) => {
  console.log(reason)
  process.exit(1)
})