import React from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from '../contexts/UserContext';

import { Mutation } from 'react-apollo';

import { AUTH_TOKEN } from '../constants';
import { LOGIN_MUTATION, GUEST_LOGIN_MUTATION } from '../queries';

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: ''
		}
		this.confirmLogin = this.confirmLogin.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	confirmLogin(data, updateUser) {
		this.setState({
			username: '',
			password: ''
		});
		localStorage.setItem(AUTH_TOKEN, data.token);
		updateUser();
	}

	handleInputChange(event) {
	    this.setState({
	      [event.target.name]: event.target.value
	    });
	}

	logout(updateUser) {
		this.setState({
			username: '',
			password: ''
		});
		localStorage.removeItem(AUTH_TOKEN);
		updateUser();
	}

	render() {
		return (
			<UserContext.Consumer>
				{({user, updateUser}) => {
					if (user) {
						return (
							<header>
								<p>Welcome, {user.username}</p>
								<button onClick={() => this.logout(updateUser)}>Logout</button>
							</header>
						);
					} else {
						return (
							<header>
							<Mutation mutation={LOGIN_MUTATION} variables={{ login: {
								username: this.state.username,
								password: this.state.password
							}}} onCompleted={data => this.confirmLogin(data.login, updateUser)}>
							{(mutation, {loading, error}) => (
									<aside>
										{ loading && <p>Loading...</p> }
										{ error && <p> {error.message} </p> }
										<input type="text" name="username" placeholder="Username" onChange={this.handleInputChange}
											value={this.state.username} required="required"></input>
										<input type="password" name="password" placeholder="Password" onChange={this.handleInputChange}
											value={this.state.password} required="required"></input>
										<button onClick={mutation}>Log In</button>
										<Link to="/register">Register</Link>
									</aside>
							)}
							</Mutation>
							<Mutation mutation={GUEST_LOGIN_MUTATION} onCompleted={data => this.confirmLogin(data.guestLogin, updateUser)}>
							{(mutation, {loading, error}) => (
								<button onClick={mutation}>Login as Guest</button>
							)}
							</Mutation>
							</header>
						)
					}
				}}
			</UserContext.Consumer>
		);
	}
}

export default Login;