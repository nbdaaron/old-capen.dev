/**
* Called to setup page routes.
*/
module.exports = (app) => {
	// Routes
	app.get('/', (req, res) => {
		res.render('home', {
			user: req.user,
			error: req.session.error
		});

		delete req.session.error;
	});

	app.get('/register', (req, res) => {
		res.render('register', {
			error: req.session.error
		});

		delete req.session.error;
	});

	app.get('/vipArea', enforceLoggedIn, (req, res) => {
		res.send('This is the super secret area haha. Not much to see here.');
	});

}

function enforceLoggedIn(req, res, next) {
    if (req.user) {
      	return next();
    }
    req.session.error = { 
    	message: 'You must be logged in to see that!'
    };
  	res.redirect('/');
}