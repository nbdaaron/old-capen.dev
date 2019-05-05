import React from 'react';
import { BrowserRouter as Link } from 'react-router-dom';

class Home extends React.Component {
	render() {
		return (
			<main>
			    <h1>Example App: Home</h1>
				<Link to='/vipArea'>Click here to see the super secret VIP Area!</Link>
				<br />
				<Login />
				<br />
				<Chat />
			</main>
		);
	}
}

export default Home;