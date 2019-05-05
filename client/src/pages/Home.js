import React from 'react';
import {  Link } from 'react-router-dom';
import Login from '../components/Login';
import Chat from '../components/Chat';

class Home extends React.Component {
	render() {
		return (
			<main>
			    <h1>Example App: Home</h1>
				<Link to='/profile'>Click here to see your profile!</Link>
				<br />
				<Login />
				<br />
				<Chat />
			</main>
		);
	}
}

export default Home;