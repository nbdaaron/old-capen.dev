module.exports = {
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