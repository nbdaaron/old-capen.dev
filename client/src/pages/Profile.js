import React from 'react';
import { Redirect } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';

class Profile extends React.Component {
	render() {

		return (
			<UserContext.Consumer>
				{({user, updateUser}) => {
					if (!user) {
						return <Redirect to='/'></Redirect>
					} else {
						return (
							<main>
								<h1>{user.username}</h1>
								<h2>Your user ID: {user.id}</h2>
								<h2>Your E-mail Address: {user.email}</h2>
							</main>
						);
					}
				}}
			</UserContext.Consumer>
		);
	}
}

export default Profile;