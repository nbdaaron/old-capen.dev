import { gql } from "apollo-boost";

export const GET_USER = gql`
  	{
	    user {
	    	id
	    	username
	    	email
	    }
  	}
`;

export const SIGNUP_MUTATION = gql`
  mutation RegisterMutation($user: UserInput!) {
    register(user: $user) {
    	id
      	token
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation LoginMutation($login: LoginInput!) {
    login(user: $login) {
    	id
      	token
    }
  }
`;

export const GUEST_LOGIN_MUTATION = gql`
  mutation GuestLoginMutation {
    guestLogin {
    	id
      	token
    }
  }
`;

export const SEND_CHAT_MESSAGE_MUTATION = gql`
  mutation SendChatMessageMutation($message: String!) {
    sendChatMessage(message: $message)
  }
`;

export const CHAT_MESSAGE_SUBSCRIPTION = gql`
  subscription chatMessage {
    chatMessage {
      username
      message
    }
  }
`;