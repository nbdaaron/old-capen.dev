const DummyStrategy = require('passport-dummy').Strategy;

module.exports = new DummyStrategy(
	function(done) {
    	return done(null, {
    		name: 'Guest'
    	});
	}
);