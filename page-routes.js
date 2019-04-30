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
}