const DummyStrategy = require('passport-dummy').Strategy;
var startingPoint = parseInt(Math.random() * 50000) + 20000;

module.exports = new DummyStrategy(
	function(done) {
		startingPoint += parseInt(Math.random() * 10);
    	return done(null, {
    		id: '*Guest' + startingPoint,
    		username: 'Guest' + startingPoint
    	});
	}
);