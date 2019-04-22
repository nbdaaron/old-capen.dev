const LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy((username, password, done) => {
    if (username == 'aaron' && password == 'kau') {
        done(null, {
            name: 'Capen'
        });
    } else {
        done(null, false, {
            message: 'Incorrect Credentials'
        });
    }
});