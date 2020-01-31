function makeNotesArray(){
    return [
        {
            id: 1,
            title: 'First test note!',
            content: 'Lorem ipsum dolor sit amet.',
            modified_date: '2029-01-22T16:28:32.615Z',
            folder: 1
        },
        {
            id: 2,
            title: 'Second test post!',
            content: 'Lorem ipsum dolor sit amet.',
            modified_date: '2100-05-22T16:28:32.615Z',
            folder: 1
        },
        {
            id: 3,
            title: 'Third test post!',
            content: 'Lorem ipsum dolor sit amet.',
            modified_date: '1919-12-22T16:28:32.615Z',
            folder: 2
        },
        {
            id: 4,
            title: 'Fourth test post!',
            content: 'Lorem ipsum dolor sit amet.',
            modified_date: '1919-12-22T16:28:32.615Z',
            folder: 3
        }
    ]
}

function makeMaliciousNote(){
    const maliciousNote = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
    }

    const expectedNote = {
        ...maliciousNote,
        title: `Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }

    return {
        maliciousNote,
        expectedNote
    }
}

module.exports = {
    makeNotesArray,
    makeMaliciousNote
}