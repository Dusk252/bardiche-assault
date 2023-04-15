module.exports = {
  async up(db) {
    await db.collection('user_locale').dropIndex('serverId_1_userId_1');
    await db.collection('user_locale').createIndex({ 'userId': 1 }, { 'unique': true });
    await db.collection('user_locale')
      .update({}, { $unset: { serverId:1 } }, { multi: true });
  },

  async down() {
    // TODO write the statements to rollback your migration (if possible)
  },
};
