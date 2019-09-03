// demo user data
const users = [
    {
        id: '1',
        name: 'Alejandro',
        email: 'alex@example.com'
    },
    {
        id: '2',
        name: 'Patricia',
        email: 'paty@example.com',
        age: 61
    },
    {
        id: '3',
        name: 'Magdaleno',
        email: 'mag@example.com',
        age: 58
    }
];

// demo post data
// now adding the 'author' property which will hold the user's id that made the post
const posts = [
    {
        id: '10',
        title: 'Why are people always so mad?',
        body: 'Is everyone stupid or what? I do not understand.',
        published: false,
        author: '1'
    },
    {
        id: '11',
        title: 'How are we not deserving of dog love',
        body: 'They are so cute ad we are humans are pretty despicable.',
        published: true,
        author: '1'
    },
    {
        id: '12',
        title: 'What makes me one of the worst failure sons of all time',
        body: 'I am unemployed taking courses on Udemy to replace school. Fuck my life.',
        published: false,
        author: '2'
    }
];

// dummy comments
// added an author id to identify who wrote the comment
// also added a post id to identify what post owns this comment
const comments = [
    {
        id: '100',
        text: 'This is pure non-sense.',
        author: '2',
        post: '10'
    },
    {
        id: '101',
        text: 'How did you formulate this opinion?',
        author: '3',
        post: '12'
    },
    {
        id: '102',
        text: 'Lol that was not funny.',
        author: '3',
        post: '11'
    },
    {
        id: '103',
        text: 'Kono Dio Da!',
        author: '1',
        post: '11'
    }
];

const db = {
    users,
    posts,
    comments
};

export { db as default };