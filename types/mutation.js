const config = require('../config');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUser } = require('../utils');

// Guest IDs are always increasing. They start at a random value and increment randomly.
var guestId = parseInt(Math.random() * 50000) + 20000;

var chatMessageId = 100;

module.exports = {
	/*
	 * Attempts to login with the specified credentials
	 * @arg user: LoginInput - The login information
	 * LoginInput stores usernamd ans password as Strings.
	 */
	login: async (root, args, context, info) => {
		let credentials = args.user;
		let user = await context.prisma.user({ username: credentials.username });
		if (!user) {
			throw new Error('Username not found');
		}
		let correctPassword = await bcrypt.compare(credentials.password, user.password);
		if (correctPassword) {
			return {
				id: user.id,
				token: jwt.sign({ id: user.id, username: credentials.username }, config.JWT_SECRET)
			};
		}
		throw new Error('Incorrect Password');
	},
	/*
	 * Attempts to login as a guest. No input is needed nor provided.
	 */
	guestLogin: async (root, args, context, info) => {
		guestId += parseInt(Math.random() * 10) + 1;
    	let user = {
    		id: '*Guest' + guestId,
    		username: 'Guest' + guestId
    	};
    	return {
    		id: user.id,
    		token: jwt.sign(user, config.JWT_SECRET)
    	};
	},
	/*
	 * Registers new user from the Registration page.
	 * @arg user: UserInput - The registration information
	 * UserInput stores username, password, confirm (confirm password field), and email as Strings.
	 */
	register: async (root, args, context, info) => {
		let user = args.user;
		if (user.password != user.confirm) {
			throw new Error("Passwords do not match!");
		}
		if (user.username.startsWith('*')) {
			throw new Error("Usernames cannot start with the '*' character!");
		}
		let passHash = await bcrypt.hash(user.password, config.saltRounds);
		let ret = await context.prisma.createUser({
			username: user.username,
			password: passHash,
			email: user.email
		});
		return {
			id: ret.id,
			token: jwt.sign({ id: ret.id, username: user.username }, config.JWT_SECRET)
		};
	},
	/*
	 * Sends chat message to the home page chat box.
	 * @arg message: String - The message to send to the chat box.
	 */
	sendChatMessage: async (root, args, context, info) => {
		let user = getUser(context);
		console.log("CHAT MESSAGE: " + user.username + ": " + args.message);
		let message = await context.prisma.createChatMessage({
			username: user.username,
			message: args.message
		});
		context.pubsub.publish(config.channels.homeChatChannel, { chatMessage: {
			messageId: message.messageId,
			username: message.username, 
			message: message.message
		}});
		return args.message;
	},
	/*
	 * Connects two users and adds them to each others' friends list.
	 * @arg p1: User - The user that initiated the friend request.
	 * @arg p2: User - The user that accepted the friend request.
	 */
	addFriends: async (root, args, context, info) => {
		if (args.from == args.to) {
			throw new Error("You cannot be friends with yourself!!");
		}
		let p1 = context.prisma.updateUser({
			data: {
				friends: {
					connect: {
						id: args.from
					}
				}
			},
			where: {
				id: args.to
			}
		});
		let p2 = context.prisma.updateUser({
			data: {
				friends: {
					connect: {
						id: args.to
					}
				}
			},
			where: {
				id: args.from
			}
		});
		[p1, p2] = await Promise.all([p1, p2]);
		return p1;
	}
}