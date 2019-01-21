interface PostData {
    title: string;
    content: string;
}

const store = {
    data: {
        posts: [] as PostData[],
    },

    fetchPosts: () => {
        fetch('http://anorwell.com/content.py')
            .then((response) => response.json())
            .then((json) => store.data.posts = json);
    },
};

export default store;
