"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const front_matter_1 = __importDefault(require("front-matter"));
const moment_1 = __importDefault(require("moment"));
let config = {
    // where to place generated posts, relative to outDir
    posts: "content/posts",
    // Where to place the posts manifest file, relative to outDir
    manifestPath: "content/posts.json",
    // The parent directory for precompiled assets
    outDir: "public"
};
class Post {
    constructor(file, title, date, tags, content) {
        this.file = file;
        this.title = title;
        this.date = date;
        this.tags = tags;
        this.content = content;
    }
    toSummary() {
        return { path: this.file, title: this.title, tags: this.tags, date: this.date.format() };
    }
}
async function run() {
    let posts = await loadPosts(config.posts);
    for (const p of posts) {
        await writePost(config.outDir, p);
    }
    await writeManifest(`${config.outDir}/${config.manifestPath}`, posts);
}
async function loadPosts(dir) {
    let files = await util_1.promisify(fs.readdir)(dir);
    let out = [];
    for (let file of files) {
        out.push(await parsePost(dir + "/" + file));
    }
    ;
    return out;
}
async function writePost(outDir, post) {
    let fullPath = `${outDir}/${post.file}`;
    let directory = path_1.default.dirname(fullPath);
    await util_1.promisify(fs.mkdir)(directory, { recursive: true });
    await util_1.promisify(fs.writeFile)(fullPath, post.content);
}
async function writeManifest(outPath, posts) {
    let index = posts
        .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
        .map(p => p.toSummary());
    await util_1.promisify(fs.writeFile)(outPath, JSON.stringify(index));
}
async function parsePost(path) {
    let content = await util_1.promisify(fs.readFile)(path);
    let parsed = front_matter_1.default(content.toString());
    let time = moment_1.default(parsed.attributes.date);
    let tags = (parsed.attributes.tags || '').split(",").map((s) => s.replace(/ /g, ''));
    return new Post(path, parsed.attributes.title, time, tags, parsed.body);
}
console.log("Precompiling");
run().catch((reason) => {
    console.log(reason);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFFdkMsSUFBSSxNQUFNLEdBQUc7SUFDWCxxREFBcUQ7SUFDckQsS0FBSyxFQUFFLGVBQWU7SUFFdEIsNkRBQTZEO0lBQzdELFlBQVksRUFBRSxvQkFBb0I7SUFFbEMsOENBQThDO0lBQzlDLE1BQU0sRUFBRSxRQUFRO0NBQ2pCLENBQUE7QUFFRCxNQUFNLElBQUk7SUFDUixZQUNTLElBQVksRUFDWixLQUFhLEVBQ2IsSUFBWSxFQUNaLElBQWMsRUFDZCxPQUFlO1FBSmYsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osU0FBSSxHQUFKLElBQUksQ0FBVTtRQUNkLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO0lBRTVCLFNBQVM7UUFDUCxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtJQUMxRixDQUFDO0NBQ0Y7QUFFRCxLQUFLLFVBQVUsR0FBRztJQUNoQixJQUFJLEtBQUssR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFekMsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUU7UUFDckIsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUNsQztJQUNELE1BQU0sYUFBYSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDdkUsQ0FBQztBQUVELEtBQUssVUFBVSxTQUFTLENBQUMsR0FBVztJQUNsQyxJQUFJLEtBQUssR0FBRyxNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzVDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQTtJQUNwQixLQUFJLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUM1QztJQUFBLENBQUM7SUFDRixPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUM7QUFFRCxLQUFLLFVBQVUsU0FBUyxDQUFDLE1BQWMsRUFBRSxJQUFVO0lBQ2pELElBQUksUUFBUSxHQUFHLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUN2QyxJQUFJLFNBQVMsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXZDLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7SUFDekQsTUFBTSxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3ZELENBQUM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLE9BQWUsRUFBRSxLQUFrQjtJQUM5RCxJQUFJLEtBQUssR0FBRyxLQUFLO1NBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsMEJBQTBCO1NBQzlFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBRTFCLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUMvRCxDQUFDO0FBRUQsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFZO0lBQ25DLElBQUksT0FBTyxHQUFHLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEQsSUFBSSxNQUFNLEdBQUcsc0JBQUUsQ0FBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUN4QyxJQUFJLElBQUksR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDekMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQzVGLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3pFLENBQUM7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBRTNCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO0lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUMsQ0FBQSJ9