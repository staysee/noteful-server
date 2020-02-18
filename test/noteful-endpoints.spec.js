const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')
const { makeNotesArray, makeMaliciousNote } = require('./notes.fixtures')


describe(`Notes Endpoints`, function() {
    let db 

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    afterEach('cleanup',() => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    describe('GET /api/notes', () => {
        context('Given no notes', () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })
        })

        context('Given there are notes in the database', () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert notes', () => {
                return db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                    return db
                        .into('noteful_notes')
                        .insert(testNotes)
                })
            })
            
            it('responds with 200 and gets all of the notes', () => {
                return supertest(app)
                .get('/api/notes')
                .expect(200, testNotes)
            })
        })

        context(`Given an XSS attack note`, () => {
            const testFolders = makeFoldersArray()
            const { maliciousNote, expectedNote } = makeMaliciousNote()

            beforeEach(`insert malicious note`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert([maliciousNote])
                    })
            })

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/notes`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].title).to.eql(expectedNote.title)
                        expect(res.body[0].content).to.eql(expectedNote.content)
                    })
            })
        })
    })

    describe('GET /api/notes/:note_id', () => {
        context(`Given there are no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(404, { error: { message: `Note doesn't exist`}})
            })
        })

        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(`insert notes`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 200 and the specifid note`, () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200, expectedNote)
            })
        })

        context(`Given an XSS attack article`, () => {
            const testFolders = makeFoldersArray()
            const { maliciousNote, expectedNote } = makeMaliciousNote()

            beforeEach(`insert malicious note`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert([maliciousNote])
                    })
            })

            it(`removes XSS attack content1`, () => {
                return supertest(app)
                    .get(`/api/notes/${maliciousNote.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.title).to.eql(expectedNote.title)
                        expect(res.body.content).to.eql(expectedNote.content)
                    })
            })
        }) 
    })

    describe(`POST /api/notes`, () => {
        const testFolders = makeFoldersArray()

        beforeEach('insert malicious note', () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })
        it(`creates a note, responding with 201 and the new article`, () => {
            this.retries(3)
            const newNote = {
                title: 'Test new note',
                content: 'test content',
                folder_id: 1
            }
            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newNote.title)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified_date).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                )

                const requiredFields = ['title', 'folder_id']

                requiredFields.forEach(field => {
                    const newNote = {
                        title: 'Test new note', 
                        content: 'some content',
                        folder_id: 2
                    }

                    it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                        delete newNote[field]

                        return supertest(app)
                            .post('/api/notes')
                            .send(newNote)
                            .expect(400, {
                                error: { message: `Missing '${field}' in request body`}
                            })
                    })
                })

                it(`removes XSS attack content from response`, () => {
                    const { maliciousNote, expectedNote } = makeMaliciousNote()
                    return supertest(app)
                        .post(`/api/notes`)
                        .send(maliciousNote)
                        .expect(201)
                        .expect(res => {
                            expect(res.body.title).to.eql(expectedNote.title)
                            expect(res.body.content).to.eql(expectedNote.content)
                        })
                })
        })

    })

    describe(`DELETE /api/notes/note_id`, () => {
        context(`Given no note`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .delete(`/api/notes/${noteId}`)
                    .expect(404, { error: { message: `Note doesn't exist`}})
            })
        })
        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(`insert note`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 204 and removes the note`, () => {
                const idToRemove = 2
                const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/notes/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                        .get(`/api/notes`)
                        .expect(expectedNotes)
                    )
            })
        })
    })

    describe(`PATCH /api/notes/:note_id`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .expect(404, { error: { message: `Note doesn't exist`}})
            })
        })

        context(`Given there are articles in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach(`insert notes`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 204 and updates the note`, () => {
                const idToUpdate = 2
                const updateNote = {
                    name: 'updated note name',
                    content: 'updating content',
                    folder_id: 3
                }
                const expectedNote = {
                    ...testNotes[idToUpdate-1],
                    ...updateNote
                }
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send(updateNote)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes/${idToUpdate}`)
                            .expect(expectedNote)
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({ irrelevantFields: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'name', 'content', 'Id'.`
                        }
                    })
            })

            it(`respond with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updateNote = {
                    name: 'updated note name'
                }
                const expectedNote = {
                    ...testNotes[idToUpdate-1],
                    ...updateNote
                }

                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({
                        ...updateNote,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes/${idToUpdate}`)
                            .expect(expectedNote)
                    )
            })
        })
    })
})
