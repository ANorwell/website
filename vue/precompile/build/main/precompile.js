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
    posts.forEach(async (p) => await writePost(config.outDir, p));
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
    let tags = (parsed.attributes || '').tags.split(",").map((s) => s.replace(/ /g, ''));
    return new Post(path, parsed.attributes.title, time, tags, parsed.body);
}
console.log("Precompiling");
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFFdkMsSUFBSSxNQUFNLEdBQUc7SUFDWCxxREFBcUQ7SUFDckQsS0FBSyxFQUFFLGVBQWU7SUFFdEIsNkRBQTZEO0lBQzdELFlBQVksRUFBRSxvQkFBb0I7SUFFbEMsOENBQThDO0lBQzlDLE1BQU0sRUFBRSxRQUFRO0NBQ2pCLENBQUE7QUFFRCxNQUFNLElBQUk7SUFDUixZQUNTLElBQVksRUFDWixLQUFhLEVBQ2IsSUFBWSxFQUNaLElBQWMsRUFDZCxPQUFlO1FBSmYsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osU0FBSSxHQUFKLElBQUksQ0FBVTtRQUNkLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO0lBRTVCLFNBQVM7UUFDUCxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtJQUMxRixDQUFDO0NBQ0Y7QUFFRCxLQUFLLFVBQVUsR0FBRztJQUNoQixJQUFJLEtBQUssR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENB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