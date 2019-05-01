module.exports = {
	users: (root, args, context, info) => context.prisma.users()
}