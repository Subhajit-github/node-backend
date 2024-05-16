const express = require('express');
require('dotenv').config;
const app = express();
const PORT = process.env.PORT || 3000;

const github_data = {
    "login": "Subhajit-github",
    "id": 24381507,
    "node_id": "MDQ6VXNlcjI0MzgxNTA3",
    "avatar_url": "https://avatars.githubusercontent.com/u/24381507?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/Subhajit-github",
    "html_url": "https://github.com/Subhajit-github",
    "followers_url": "https://api.github.com/users/Subhajit-github/followers",
    "following_url": "https://api.github.com/users/Subhajit-github/following{/other_user}",
    "gists_url": "https://api.github.com/users/Subhajit-github/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/Subhajit-github/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/Subhajit-github/subscriptions",
    "organizations_url": "https://api.github.com/users/Subhajit-github/orgs",
    "repos_url": "https://api.github.com/users/Subhajit-github/repos",
    "events_url": "https://api.github.com/users/Subhajit-github/events{/privacy}",
    "received_events_url": "https://api.github.com/users/Subhajit-github/received_events",
    "type": "User",
    "site_admin": false,
    "name": "Subhajit Bhattacharya",
    "company": "Siemens",
    "blog": "",
    "location": "Bengaluru",
    "email": null,
    "hireable": null,
    "bio": null,
    "twitter_username": null,
    "public_repos": 8,
    "public_gists": 0,
    "followers": 0,
    "following": 0,
    "created_at": "2016-12-05T06:02:10Z",
    "updated_at": "2024-05-16T03:23:13Z"
  }


  const jokes = [
    {
        "id": 1,
        "type": "general",
        "setup": "What did the ocean say to the beach?",
        "punchline": "Nothing, it just waved."
    },
    {
        "id": 2,
        "type": "general",
        "setup": "Why do bees hum?",
        "punchline": "Because they don't know the words."
    },
    {
        "id": 3,
        "type": "general",
        "setup": "What do you call a bee that can't make up its mind?",
        "punchline": "A maybe."
    },
    {
        "id": 4,
        "type": "general",
        "setup": "What do you call a bear with no teeth?",
        "punchline": "A gummy bear!"
    },
    {
        "id": 5,
        "type": "general",
        "setup": "Why did the chicken cross the road?",
        "punchline": "To get to the other side!"
    }
  ]

app.get('/', (req, res) => {
    res.send('Hello World!');
})


app.get('/api/jokes', (req, res) => {
    res.json(jokes);
})
app.get('/twitter', (req,res) => {
    res.send('Hello Twitter!');
})

app.get('/github', (req, res) => {
    res.json(github_data);
})

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
})
