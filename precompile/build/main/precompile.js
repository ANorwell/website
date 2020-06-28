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
const marked_1 = __importDefault(require("marked"));
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
            await this.writeContent(p);
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
    async writeContent(post) {
        const fullPath = `${config.targetDir}/${post.file}`;
        const directory = path_1.default.dirname(fullPath);
        const transformedContent = this.generateContent(post);
        await util_1.promisify(fs.mkdir)(directory, { recursive: true });
        await util_1.promisify(fs.writeFile)(fullPath, transformedContent);
        console.log(" ", fullPath);
    }
    /**
     * Generates the final content for this post.
     * - if markdown, transforms into HTML.
     * - otherwise, assumes HTML.
     */
    generateContent(post) {
        const suffix = post.file.split(".").pop();
        if ((suffix || "").toLowerCase() == "md") {
            return marked_1.default(post.content);
        }
        else {
            return post.content;
        }
    }
    async writeManifest(contentType, posts) {
        let index = posts
            .sort((a, b) => b.date.valueOf() - a.date.valueOf()) //descending order by date
            .map(p => p.toSummary());
        let outPath = `${config.targetDir}/${config.sourceDir}/${contentType}.json`;
        await util_1.promisify(fs.writeFile)(outPath, JSON.stringify(index));
        console.log("  Manifest: ", outPath);
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
let config = new Config("content", "public");
new Precompiler(config).run().catch((reason) => {
    console.log(reason);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFDdkMsb0RBQTJCO0FBRzNCLE1BQU0sTUFBTTtJQUNWO0lBQ0U7Ozs7O09BS0c7SUFDSSxTQUFpQjtJQUV4Qjs7T0FFRztJQUNJLFNBQWlCO1FBTGpCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFLakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtJQUV0QixDQUFDO0lBRUwsZ0JBQWdCLENBQUMsV0FBbUI7UUFDbEMsT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUE7SUFDM0MsQ0FBQztDQUNGO0FBRUQsTUFBTSxJQUFJO0lBQ1IsWUFDUyxJQUFZLEVBQ1osS0FBYSxFQUNiLElBQVksRUFDWixJQUFjLEVBQ2QsT0FBZTtRQUpmLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQVU7UUFDZCxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUksQ0FBQztJQUU3QixTQUFTO1FBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUE7SUFDMUYsQ0FBQztDQUNGO0FBRUQsTUFBTSxXQUFXO0lBQ2YsWUFBbUIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7SUFBSSxDQUFDO0lBRXRDLEtBQUssQ0FBQyxHQUFHO1FB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