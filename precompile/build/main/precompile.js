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
        console.log(fullPath);
        const directory = path_1.default.dirname(fullPath);
        const transformedContent = this.generateContent(post);
        await util_1.promisify(fs.mkdir)(directory, { recursive: true });
        await util_1.promisify(fs.writeFile)(fullPath, transformedContent);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QixnREFBdUI7QUFDdkIsK0JBQWdDO0FBQ2hDLGdFQUE2QjtBQUM3QixvREFBdUM7QUFDdkMsb0RBQTJCO0FBRzNCLE1BQU0sTUFBTTtJQUNWO0lBQ0U7Ozs7O09BS0c7SUFDSSxTQUFpQjtJQUV4Qjs7T0FFRztJQUNJLFNBQWlCO1FBTGpCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFLakIsY0FBUyxHQUFULFNBQVMsQ0FBUTtJQUV0QixDQUFDO0lBRUwsZ0JBQWdCLENBQUMsV0FBbUI7UUFDbEMsT0FBTyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUE7SUFDM0MsQ0FBQztDQUNGO0FBRUQsTUFBTSxJQUFJO0lBQ1IsWUFDUyxJQUFZLEVBQ1osS0FBYSxFQUNiLElBQVksRUFDWixJQUFjLEVBQ2QsT0FBZTtRQUpmLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFNBQUksR0FBSixJQUFJLENBQVU7UUFDZCxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUksQ0FBQztJQUU3QixTQUFTO1FBQ1AsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUE7SUFDMUYsQ0FBQztDQUNGO0FBRUQsTUFBTSxXQUFXO0lBQ2YsWUFBbUIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7SUFBSSxDQUFDO0lBRXRDLEtBQUssQ0FBQyxHQUFHO1FBQ1AsSUFBSSxZQUFZLEdBQUcsTUFBTSxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDaEUsS0FBSyxNQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7WUFDdEMsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLENBQUE7U0FDOUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLFdBQW1CO1FBQzdDLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuRCxLQUFLLE1BQU0sQ0FBQyxJQUFJLFFBQVEsRUFBRTtZQUN4QixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDM0I7UUFDRCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQW1CO1FBQ3BDLElBQUksS0FBSyxHQUFHLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUE7UUFDN0UsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFBO1FBQ3BCLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQTtTQUNyRjtRQUFBLENBQUM7UUFDRixPQUFPLEdBQUcsQ0FBQTtJQUNaLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLElBQVU7UUFDM0IsTUFBTSxRQUFRLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3JCLE1BQU0sU0FBUyxHQUFHLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDeEMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRXJELE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7UUFDekQsTUFBTSxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBQyxJQUFVO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ3hDLE9BQU8sZ0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDNUI7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtTQUNwQjtJQUNILENBQUM7SUFFRCxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQW1CLEVBQUUsS0FBa0I7UUFDekQsSUFBSSxLQUFLLEdBQUcsS0FBSzthQUNkLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQjthQUM5RSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUUxQixJQUFJLE9BQU8sR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLFNBQVMsSUFBSSxXQUFXLE9BQU8sQ0FBQTtRQUUzRSxNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDL0QsQ0FBQztJQUVELEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBWTtRQUM3QixJQUFJLE9BQU8sR0FBRyxNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2hELElBQUksTUFBTSxHQUFHLHNCQUFFLENBQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDeEMsSUFBSSxJQUFJLEdBQUcsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3pDLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM1RixPQUFPLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBRTNCLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUU3QyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDakIsQ0FBQyxDQUFDLENBQUEifQ==