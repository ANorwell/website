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
    posts: "content/posts",
    outDir: "dist"
};
class Post {
    constructor(file, title, date, content) {
        this.file = file;
        this.title = title;
        this.date = date;
        this.content = content;
    }
    toSummary() {
        return { file: this.file, title: this.title, date: this.date.format() };
    }
}
async function run() {
    let posts = await loadPosts(config.posts);
    console.log(posts);
    posts.forEach(async (p) => await writePost(config.outDir, p));
    await writePostIndex(config.outDir, posts);
}
async function loadPosts(dir) {
    let files = await util_1.promisify(fs.readdir)(dir);
    let out = [];
    for (let file of files) {
        out.push(await precompileFile(dir + "/" + file));
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
async function writePostIndex(outDir, posts) {
    let index = posts
        .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
        .map(p => p.toSummary());
    await util_1.promisify(fs.writeFile)(`${outDir}/posts.json`, JSON.stringify(index));
}
async function precompileFile(path) {
    let content = await util_1.promisify(fs.readFile)(path);
    let parsed = front_matter_1.default(content.toString());
    let time = moment_1.default(parsed.attributes.date);
    return new Post(path, parsed.attributes.title, time, parsed.body);
}
console.log("Precompiling");
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFFdkMsSUFBSSxNQUFNLEdBQUc7SUFDWCxLQUFLLEVBQUUsZUFBZTtJQUN0QixNQUFNLEVBQUUsTUFBTTtDQUNmLENBQUE7QUFFRCxNQUFNLElBQUk7SUFDUixZQUFtQixJQUFZLEVBQVMsS0FBYSxFQUFTLElBQVksRUFBUyxPQUFlO1FBQS9FLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO0lBRXRHLFNBQVM7UUFDUCxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRCxLQUFLLFVBQVUsR0FBRztJQUNoQixJQUFJLEtBQUssR0FBRyxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNsQixLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLE1BQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUMzRCxNQUFNLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzVDLENBQUM7QUFFRCxLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQVc7SUFDbEMsSUFBSSxLQUFLLEdBQUcsTUFBTSxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM1QyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUE7SUFDcEIsS0FBSSxJQUFJLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDckIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLGNBQWMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDakQ7SUFBQSxDQUFDO0lBQ0YsT0FBTyxHQUFHLENBQUE7QUFDWixDQUFDO0FBRUQsS0FBSyxVQUFVLFNBQVMsQ0FBQyxNQUFjLEVBQUUsSUFBVTtJQUNqRCxJQUFJLFFBQVEsR0FBRyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDdkMsSUFBSSxTQUFTLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV2QyxNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3pELE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUN2RCxDQUFDO0FBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxNQUFjLEVBQUUsS0FBa0I7SUFDOUQsSUFBSSxLQUFLLEdBQUcsS0FBSztTQUNkLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjtTQUM5RSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUUxQixNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxhQUFhLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQzlFLENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLElBQVk7SUFDeEMsSUFBSSxPQUFPLEdBQUcsTUFBTSxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoRCxJQUFJLE1BQU0sR0FBRyxzQkFBRSxDQUFNLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ3hDLElBQUksSUFBSSxHQUFHLGdCQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN6QyxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25FLENBQUM7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQzNCLEdBQUcsRUFBRSxDQUFBIn0=