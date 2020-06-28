import moment, { Moment } from 'moment';

interface PostSummary {
    path: string;
    title: string;
    tags: string;
    date: Moment;
}

class PostData {
    constructor(public summary: PostSummary, public content: string) {}
}

class Store {
    public data = {
         loadedPosts: [] as PostData[],
         postSummaries: [] as PostSummary[],
    };

    private manifest: PostSummary[]|null = null;

    constructor(private readonly postsPath: string, private readonly postsPerPage: number) {}

    public async fetchPostsByTag(tag: string | null = null) {
        this.fetchPostsByFilter((post: PostSummary) => {
            if (tag === null) {
                return !post.tags.includes('draft');
            } else {
                return post.tags.includes(tag);
            }
        });
    }

    public async fetchPostsByTitle(title: string) {
        this.fetchPostsByFilter((post: PostSummary) => post.title === title);
    }

    public async fetchMore() {
        const lastPostIndex = this.data.loadedPosts.length;
        const nextPage = this.data.postSummaries.slice(lastPostIndex, lastPostIndex + this.postsPerPage);
        const loaded = await Promise.all(nextPage.map(async (p) => this.fetchPostData(p)));
        this.data.loadedPosts = this.data.loadedPosts.concat(loaded);
    }

    private async fetchPostsByFilter(filter: (p: PostSummary) => boolean) {
        this.data.postSummaries = (await this.getManifest()).filter((post) => filter(post));
        this.data.loadedPosts = [];
        await this.fetchMore();
    }

    private async getManifest(): Promise<PostSummary[]> {
        if (this.manifest === null) {
            const out: PostSummary[] = await (await fetch(this.postsPath)).json();
            this.manifest = out;
        }
        this.manifest.forEach((p) => p.date = moment(p.date));
        return this.manifest as PostSummary[];
    }

    private async fetchPostData(summary: PostSummary): Promise<PostData> {
        const data = await (await fetch(summary.path)).text();
        return new PostData(summary, data);
    }

}

export default Store;
