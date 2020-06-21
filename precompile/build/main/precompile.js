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
class Config {
    constructor(
    /**
     * The parent directory in which the content lives.
     * This directory should be of the form:
     * <sourceDir>/<contentType>/<contentFile>
     * For example, <sourceDir>/posts/MyPost.html
     */
    sourceDir, 
    /**
     * The output directory where precompiled content will be placed.
     */
    targetDir) {
        this.sourceDir = sourceDir;
        this.targetDir = targetDir;
    }
    sourceContentDir(contentType) {
        return this.sourceDir + "/" + contentType;
    }
    targetContentDir(contentType) {
        return this.targetDir + "/" + contentType;
    }
}
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
class Precompiler {
    constructor(config) {
        this.config = config;
    }
    async run() {
        let contentTypes = await util_1.promisify(fs.readdir)(config.sourceDir);
        for (const contentType of contentTypes) {
            await this.precompileContentType(contentType);
        }
    }
    async precompileContentType(contentType) {
        let contents = await this.loadContents(contentType);
        for (const p of contents) {
            await this.writeContent(contentType, p);
        }
        await this.writeManifest(contentType, contents);
    }
    async loadContents(contentType) {
        let files = await util_1.promisify(fs.readdir)(config.sourceContentDir(contentType));
        let out = [];
        for (let file of files) {
            out.push(await this.parseContent(config.sourceContentDir(contentType) + "/" + file));
        }
        ;
        return out;
    }
    async writeContent(contentType, post) {
        let fullPath = `${config.targetContentDir(contentType)}/${post.file}`;
        let directory = path_1.default.dirname(fullPath);
        await util_1.promisify(fs.mkdir)(directory, { recursive: true });
        await util_1.promisify(fs.writeFile)(fullPath, post.content);
    }
    async writeManifest(contentType, posts) {
        let index = posts
            .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
            .map(p => p.toSummary());
        let outPath = `${config.targetDir}/${contentType}.json`;
        await util_1.promisify(fs.writeFile)(outPath, JSON.stringify(index));
    }
    async parseContent(path) {
        let content = await util_1.promisify(fs.readFile)(path);
        let parsed = front_matter_1.default(content.toString());
        let time = moment_1.default(parsed.attributes.date);
        let tags = (parsed.attributes.tags || '').split(",").map((s) => s.replace(/ /g, ''));
        return new Post(path, parsed.attributes.title, time, tags, parsed.body);
    }
}
console.log("Precompiling");
let config = new Config("content", "public/content");
new Precompiler(config).run().catch((reason) => {
    console.log(reason);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFFdkMsTUFBTSxNQUFNO0lBQ1Y7SUFDRTs7Ozs7T0FLRztJQUNJLFNBQWlCO0lBRXhCOztPQUVHO0lBQ0ksU0FBaUI7UUFMakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUtqQixjQUFTLEdBQVQsU0FBUyxDQUFRO0lBRXRCLENBQUM7SUFFTCxnQkFBZ0IsQ0FBQyxXQUFtQjtRQUNsQyxPQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQTtJQUMzQyxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsV0FBbUI7UUFDbEMsT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUE7SUFDM0MsQ0FBQztDQUNGO0FBRUQsTUFBTSxJQUFJO0lBQ1IsWUFDUyxJQUFZLEVBQ1osS0FBYSxFQUNiLElBQVksRUFDWixJQUFjLEVBQ2QsT0FBZTtRQUpmLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQVU7UUFDZCxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUksQ0FBQztJQUU3QixTQUFTO1FBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUE7SUFDMUYsQ0FBQztDQUNGO0FBRUQsTUFBTSxXQUFXO0lB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