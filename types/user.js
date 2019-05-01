module.exports = {
	friends: (root, args, context, info) => context.prisma.user({id: root.id}).friends()
};