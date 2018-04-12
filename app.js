const request = require('request');
const fs = require('fs');

const tags = [
	"javascript",
	"csharp",
	"web",
	"programming"
];

function throwerr(err) {
	if (err) console.log(err);
}

fs.readFile("data/friendlist.json", (err, data) => {
	let friendlist = JSON.parse(data);

	tags.forEach(tag => {
		request.get(`https://www.instagram.com/explore/tags/${tag}/`, (error, response, body) => {
			const data = JSON.parse(/<script type=\"text\/javascript\">window\._sharedData = (.*?);<\/script>/g.exec(body)[1]);

			data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges.forEach(obj => {
				const node = obj.node;

				request.get(`https://www.instagram.com/p/${node.shortcode}`, (error, response, body) => {
					const dataPost = JSON.parse(/<script type=\"text\/javascript\">window\._sharedData = (.*?);<\/script>/g.exec(body)[1]);

					let itemsProcessed = 0;

					dataPost.entry_data.PostPage[0].graphql.shortcode_media.edge_media_preview_like.edges.forEach(obj => {
						const node = obj.node;

						if (friendlist.indexOf(node.username) === -1) {
							friendlist.push(node.username);
						}

						itemsProcessed++;
						if (itemsProcessed === dataPost.entry_data.PostPage[0].graphql.shortcode_media.edge_media_preview_like.edges.length) {
							fs.writeFile("data/friendlist.json", JSON.stringify(friendlist), throwerr);
						}
					});
				});
			});
		});
	});
});