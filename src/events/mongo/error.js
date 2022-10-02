module.exports = {
    name: 'connectionClosed',
    execute: async (err) => {
        console.log(`An error occurred with the database connection:\n${err.message}.`);
    },
};