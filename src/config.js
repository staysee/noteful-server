module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: processenv.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || 'postgresql://dunder_mifflin@localhost/noteful'
}