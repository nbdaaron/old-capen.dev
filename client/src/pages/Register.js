import React from 'react';
import { Mutation } from 'react-apollo';
import { SIGNUP_MUTATION } from '../queries';
import { AUTH_TOKEN } from '../constants';
import { UserContext } from '../contexts/UserContext';

class Register extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: '',
			confirm: '',
			email: '',
			error: ''
		};

		this.completeRegistration = this.completeRegistration.bind(this);
		this.submitRegistration = this.submitRegistration.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	completeRegistration(data, updateUser) {
		localStorage.setItem(AUTH_TOKEN, data.register.token);
		updateUser();
		this.props.history.push('/')
	}

	handleInputChange(event) {
		this.setState({
	      [event.target.name]: event.target.value
	    });
	}

	submitRegistration(mutation) {
		if (this.state.password !== this.state.confirm) {
			this.setState({ error: 'Passwords must match!' });
			return;
		}

		this.setState({error: ''});
		mutation();
	}

	render() {
		return (
			<UserContext.Consumer>
				{({user, updateUser}) => (
					<Mutation mutation={SIGNUP_MUTATION} variables={{ user: {
						username: this.state.username,
						password: this.state.password,
						confirm: this.state.confirm,
						email: this.state.email
					}}} onCompleted={data => this.completeRegistration(data, updateUser)}>
					{(mutation, {loading, error}) => (
					<main>
						{this.state.error && <p>{this.state.error}</p>}
						{loading && <p>Loading...</p>}
						{error && <p>{error.message}</p>}
						<input name='username' type='text' placeholder='Username' required='required'
							onChange={this.handleInputChange} value={this.state.username}></input>
						<input name='password' type='password' placeholder='Password' required='required'
							onChange={this.handleInputChange} value={this.state.password}></input>
						<input name='confirm' type='password' placeholder='Confirm Password' required='required'
							onChange={this.handleInputChange} value={this.state.confirm}></input>
						<input name='email' type='email' placeholder='E-mail Address' required='required'
							onChange={this.handleInputChange} value={this.state.email}></input>
						<button onClick={() => this.submitRegistration(mutation)}>Submit</button>
					</main>
					)}
					</Mutation>
			)}
			</UserContext.Consumer>
		);
	}
}

export default Register;