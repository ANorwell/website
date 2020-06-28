function post() {
    var posts = {};
    var populatePostsCallback = function(e) {
        if ( (this.readyState == 4) && (this.status == 200) ) {
            var data = JSON.parse(this.responseText);
        }
        select_elt = $("#postlist")
        for (i in data) {
            post = data[i];
            id = post["id"]
            posts[id] = post;
            select_elt.append('<option id="post' + id +
                              '" value="' + id + '">' +
                              post["title"] + "</option>");
        }       
    };
    
    return {
        populatePosts: function() {
            var req = new XMLHttpRequest();
            req.onreadystatechange = populatePostsCallback;
            req.open("GET", "content.py?maxposts=100000", true)
            req.send("")

            //get the list of posts with a GET to
            // http://anorwell.com/content.py?title=1&maxposts=100000
            //use postCallback as callback
        },

        selectForEdit: function(id) {
            var post = posts[id];
            $("#formtitle").val(post["title"]);
            $("#formtype").val(post["type"]);
            CKEDITOR.instances.content.setData(post["content"]);
        }
    };

};

var gPost = post();
gPost.populatePosts();