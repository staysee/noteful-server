function makeFoldersArray() {
    return [
        {
            id: 1,
            title: 'First Test Folder'
        },
        {
            id: 2,
            title: 'Second Test Folder'
        },
        {
            id: 3,
            title: 'Third Test Folder'
        }

    ]
}

function makeMaliciousFolder(){
    const maliciousFolder = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>'
    }

    const expectedFolder = {
        ...maliciousFolder,
        title: `Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;`
    }

    return {
        maliciousFolder,
        expectedFolder
    }
}

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder
}