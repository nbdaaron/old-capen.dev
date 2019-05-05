import React from 'react';
import { GET_CHAT_MESSAGES, SEND_CHAT_MESSAGE_MUTATION, CHAT_MESSAGE_SUBSCRIPTION } from '../queries';
import { Query, Mutation } from 'react-apollo';
import { UserContext } from '../contexts/UserContext';

/*
 * Chat Box Component
 */
class Chat extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			value: '',
			messages: []
		};

		this.handleChange = this.handleChange.bind(this);
		this.clearValue = this.clearValue.bind(this);
	}

	handleChange(event) {
		this.setState({
			value: event.target.value
		});
	}

	clearValue() {
		this.setState({value: ''});
	}

	subscribeForMoreMessages(subscribeToMore) {
		subscribeToMore({
		    document: CHAT_MESSAGE_SUBSCRIPTION,
		    updateQuery: (prev, { subscriptionData }) => {
		      	if (!subscriptionData.data) return prev;
		      	const newMessage = subscriptionData.data.chatMessage;
		      	const exists = prev.getChatMessages.find(({ messageId }) => messageId === newMessage.messageId);
		      	if (exists) return prev;
		      	return Object.assign({}, prev, {
		        	getChatMessages: [...prev.getChatMessages, newMessage]
		      	});
		    }
	  	});
	}

	render() {
		return (
			<UserContext.Consumer>
				{({user, updateUser}) => (
				<article>
					<Query query={GET_CHAT_MESSAGES}>
    				{({ loading, error, data, subscribeToMore }) => {
      					if (loading) return <p>Fetching</p>
          				if (error) return <p>Error</p>
          				this.subscribeForMoreMessages(subscribeToMore);
          				const messagesToRender = data.getChatMessages;
          				return (
          					<section>
          						{messagesToRender.map((message, index) => (
				                <p key={message.messageId} index={index}>{message.username}: {message.message}</p>
				              ))}
          					</section>
          				);
				    }}
  					</Query>
					<textarea placeholder={user ? "Enter Message Here" : "You must be logged in to send messages!"}
						id="text" rows="3" disabled={!user} onChange={this.handleChange} value={this.state.value}></textarea>
					<Mutation mutation={SEND_CHAT_MESSAGE_MUTATION} variables={{message: this.state.value}}
						onCompleted={this.clearValue}>
						{(mutation, {loading, error}) => (
							<button onClick={mutation} disabled={!user}>Send</button>
						)}
					</Mutation>
				</article>
			)}
			</UserContext.Consumer>
		);
		
	}
}

export default Chat;