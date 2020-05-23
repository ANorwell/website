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
const util_1 = require("util");
const front_matter_1 = __importDefault(require("front-matter"));
// import * as moment from "moment"
//import { FrontMatterResult } from "front-matter"
async function run() {
    let out = await precompile("content/posts");
    console.log(out);
}
async function precompile(dir) {
    let files = await util_1.promisify(fs.readdir)(dir);
    let out = [];
    for (let file of files) {
        out.push(await precompileFile(dir + "/" + file));
    }
    ;
    return out;
}
async function precompileFile(path) {
    let content = await util_1.promisify(fs.readFile)(path);
    console.log(front_matter_1.default);
    console.log(front_matter_1.default(content.toString()));
    return content.toString();
}
console.log("Precompiling");
run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlY29tcGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wcmVjb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF3QjtBQUN4QiwrQkFBZ0M7QUFDaEMsZ0VBQTZCO0FBQzdCLG1DQUFtQztBQUNuQyxrREFBa0Q7QUFFbEQsS0FBSyxVQUFVLEdBQUc7SUFDaEIsSUFBSSxHQUFHLEdBQUcsTUFBTSxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNsQixDQUFDO0FBRUQsS0FBSyxVQUFVLFVBQVUsQ0FBQyxHQUFXO0lBQ25DLElBQUksS0FBSyxHQUFHLE1BQU0sZ0JBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDNUMsSUFBSSxHQUFHLEdBQWEsRUFBRSxDQUFBO0lBQ3RCLEtBQUksSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxjQUFjLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2pEO0lBQUEsQ0FBQztJQUNGLE9BQU8sR0FBRyxDQUFBO0FBQ1osQ0FBQztBQUVELEtBQUssVUFBVSxjQUFjLENBQUMsSUFBWTtJQUN4QyxJQUFJLE9BQU8sR0FBRyxNQUFNLGdCQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRWhELE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQUUsQ0FBQyxDQUFBO0lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDbkMsT0FBTyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDM0IsQ0FBQztBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDM0IsR0FBRyxFQUFFLENBQUEifQ==