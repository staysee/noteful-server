function makeNotesArray(){
    return [
        {
            id: 1,
            name: 'First test note!',
            content: 'Lorem ipsum dolor sit amet.',
            modified: '2029-01-22T16:28:32.615Z',
            folderId: 1
        },
        {
            id: 2,
            name: 'Second test post!',
            content: 'Lorem ipsum dolor sit amet.',
            modified: '2100-05-22T16:28:32.615Z',
            folderId: 1
        },
        {
            id: 3,
            name: 'Third test post!',
            content: 'Lorem ipsum dolor sit amet.',
            modified: '1919-12-22T16:28:32.615Z',
            folderId: 2
        },
        {
            id: 4,
            name: 'Fourth test post!',
            content: 'Lorem ipsum dolor sit amet.',
            modified: '1919-12-22T16:28:32.615Z',
            folderId: 3
        }
    ]
}

function makeMaliciousNote(){
    const maliciousNote = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        folderId: 2
    }

    const expectedNote = {
        ...maliciousNote,
        name: `Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`,
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
        folderId: 2
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