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
    constructor(file, title, date, content) {
        this.file = file;
        this.title = title;
        this.date = date;
        this.content = content;
    }
    toSummary() {
        return { path: this.file, title: this.title, date: this.date.format() };
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
    return new Post(path, parsed.attributes.title, time, parsed.body);
}
console.log("Precompiling");
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFFdkMsSUFBSSxNQUFNLEdBQUc7SUFDWCxxREFBcUQ7SUFDckQsS0FBSyxFQUFFLGVBQWU7SUFFdEIsNkRBQTZEO0lBQzdELFlBQVksRUFBRSxvQkFBb0I7SUFFbEMsOENBQThDO0lBQzlDLE1BQU0sRUFBRSxRQUFRO0NBQ2pCLENBQUE7QUFFRCxNQUFNLElBQUk7SUFDUixZQUNTLElBQVksRUFDWixLQUFhLEVBQ2IsSUFBWSxFQUNaLE9BQWU7UUFIZixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQztJQUU1QixTQUFTO1FBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUE7SUFDekUsQ0FBQztDQUNGO0FBRUQsS0FBSyxVQUFVLEdBQUc7SUFDaEIsSUFBSSxLQUFLLEdBQUcsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3pDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzNELE1BQU0sYUFBYSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDdkUsQ0FBQztBQUVELEtBQUssVUFBVSxTQUFTLENBQUMsR0FBVztJQUNsQyxJQUFJLEtBQUssR0FBRyxNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzVDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQTtJQUNwQixLQUFJLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtRQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sU0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUM1QztJQUFBLENBQUM7SUFDRixPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUM7QUFFRCxLQUFLLFVBQVUsU0FBUyxDQUFDLE1BQWMsRUFBRSxJQUFVO0lBQ2pELElBQUksUUFBUSxHQUFHLEdBQUcsTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUN2QyxJQUFJLFNBQVMsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXZDLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7SUFDekQsTUFBTSxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3ZELENBQUM7QUFFRCxLQUFLLFVBQVUsYUFBYSxDQUFDLE9BQWUsRUFBRSxLQUFrQjtJQUM5RCxJQUFJLEtBQUssR0FBRyxLQUFLO1NBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsMEJBQTBCO1NBQzlFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBRTFCLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUMvRCxDQUFDO0FBRUQsS0FBSyxVQUFVLFNBQVMsQ0FBQyxJQUFZO0lBQ25DLElBQUksT0FBTyxHQUFHLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEQsSUFBSSxNQUFNLEdBQUcsc0JBQUUsQ0FBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUN4QyxJQUFJLElBQUksR0FBRyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDekMsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNuRSxDQUFDO0FBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUMzQixHQUFHLEVBQUUsQ0FBQSJ9