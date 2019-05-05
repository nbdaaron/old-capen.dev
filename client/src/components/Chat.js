import React from 'react';
import { SEND_CHAT_MESSAGE_MUTATION, CHAT_MESSAGE_SUBSCRIPTION } from '../queries';
import { Mutation, Subscription } from 'react-apollo';
import { UserContext } from '../contexts/UserContext';


class Chat extends React.Component {


	constructor(props) {
		super(props);
		this.state = {
			value: '',
			messages: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
		this.clearValue = this.clearValue.bind(this);
	}

	handleChange(event) {
		this.setState({
			value: event.target.value
		});
	}

	sendMessage(mutation) {
		mutation();
	}

	clearValue() {
		this.setState({value: ''});
	}

	/*appendMessage(data) {
		let message = `${data.data.chatMessage.username}:${data.data.chatMessage.message}`;
		if (this.state.messages[this.state.messages.length-1] === message) {
			return false;
		}
		this.setState({ messages: this.state.messages.concat(message)});
		return false;
	}*/

	render() {
		return (
			<UserContext.Consumer>
				{({user, updateUser}) => (
				<article>
					<Subscription subscription={CHAT_MESSAGE_SUBSCRIPTION}>
				    {( data, loading ) => {
				    	return false;
				    	//if (loading || !data.data) return false;
				    	//else return this.appendMessage(data);
				    }}
				  	</Subscription>
				  	{/*this.state.messages.map((value, index) => {
				        return <p>{value}</p>
				    })*/}
					<textarea placeholder={true ? "Enter Message Here" : "You must be logged in to send messages!"}
						id="text" rows="3" disabled={false} onChange={this.handleChange} value={this.state.value}></textarea>
					<Mutation mutation={SEND_CHAT_MESSAGE_MUTATION} variables={{message: this.state.value}}
						onCompleted={this.clearValue}>
						{(mutation, {loading, error}) => (
							<button onClick={() => this.sendMessage(mutation)} disabled={!user}>Send</button>
						)}
					</Mutation>
				</article>
			)}
			</UserContext.Consumer>
		);
		
	}
}

export default Chat;