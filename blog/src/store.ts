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
         posts: [] as PostData[],
    };

    private manifest: PostSummary[]|null = null;

    public async fetchPosts(tag: string | null = null) {
        let toFetch = (await this.getManifest());

        if (tag !== null) {
            toFetch = toFetch.filter((post) => post.tags.includes(tag));
        }

        if (tag !== 'draft') {
            toFetch = toFetch.filter((post) => !post.tags.includes('draft'));
        }

        this.data.posts = await Promise.all(toFetch.map(async (p) => this.fetchPostData(p)));
    }

    private async getManifest(): Promise<PostSummary[]> {
        if (this.manifest === null) {
            const out: PostSummary[] = await (await fetch('/content/posts.json')).json();
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
