import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// Child Page Rputes
import Home from './pages/Home';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Apollo-Client (Frontend GraphQL Driver) Dependencies
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-client";
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split, ApolloLink } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SubscriptionClient } from 'subscriptions-transport-ws';

// Other Local Imports
import { GET_USER } from './queries';
import { UserContext } from './contexts/UserContext';
import { AUTH_TOKEN, HTTP_URI, WSS_URI } from './constants';

// Link for GraphQL Queries/Mutations
const httpLink = new HttpLink({
  	uri: HTTP_URI,
});

// Middleware Level for httpLink that attaches authentication information
// to each GraphQL Request
const middlewareLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem(AUTH_TOKEN);
  	operation.setContext({
    	headers: {
      		authorization: token || ''
    	}
  	});
  	return forward(operation);
});

const authorizedLink = middlewareLink.concat(httpLink);

const wsClient = new SubscriptionClient(WSS_URI, {
	reconnect: true,
	connectionParams: () => ({
		authorization: localStorage.getItem(AUTH_TOKEN) || ''
	})
});
// Link for GraphQL Subscriptions
const wsLink = new WebSocketLink(wsClient);

const link = split(
	({ query }) => {
		const { kind, operation } = getMainDefinition(query);
		return kind === 'OperationDefinition' && operation === 'subscription';
	},
	wsLink,
	authorizedLink
);

const client = new ApolloClient({
  	link,
  	cache: new InMemoryCache()
});

class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			user: null
		};

		this.updateUser();

		this.updateUser = this.updateUser.bind(this);
	}

	// Passed to all UserContext Consumers whenever the logged in user is changed
	// Re-Fetches the current user information from GraphQL Server.
	updateUser() {
		client.query({query: GET_USER, fetchPolicy: 'network-only'}).then(data => {
			this.setState({
				user: data.data.user
			});
		});
		// Connect Subscription Client with new authorization token.
		wsClient.tryReconnect();
	}

	render() {
		return (
			<ApolloProvider client={client}>
			<UserContext.Provider value={{
				user: this.state.user,
				updateUser: this.updateUser
			}}>
			    <Router>
			        <Route exact path="/" component={Home} />
			        <Route path="/register" component={Register} />
			        <Route path="/profile" component={Profile} />
			    </Router>
			</UserContext.Provider>
		    </ApolloProvider>
		);
	}
  
}

export default App;
