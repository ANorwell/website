var store = {
    data: {
        posts: [],
    },
    fetchPosts: function () {
        fetch('http://anorwell.com/posts.json')
            .then(function (response) { return response.json(); })
            .then(function (json) { return store.data.posts = json; });
    },
};
export default store;
//# sourceMappingURL=store.js.map