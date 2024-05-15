const Typesense = require('typesense');
const UsersData = require('./users.json');

(async () => {
  const typesense = new Typesense.Client({
    apiKey: 'xyz',
    nodes: [
      {
        host: 'localhost',
        port: 8108,
        protocol: 'http',
      },
    ],
  });

  try {
    await typesense.collections('users').retrieve();
    console.log('Found existing collection of users');

    console.log('Deleting collection');
    await typesense.collections('users').delete();
  } catch (err) {
    console.error(err);
  }

  console.log('Creating schema...');

  await typesense.collections().create({
    name: 'users',
    fields: [
      {
        name: 'id',
        type: 'string',
      },
      {
        name: 'email',
        type: 'string',
      },
    ],
  });

  console.log('Populating collection...');

  try {
    const users = UsersData.map(user => {
      return {
        id: user.id.toString(),
        email: user.email,
      };
    });
    const returnData = await typesense
      .collections('users')
      .documents()
      .import(users);

    console.log('Return data: ', returnData);
  } catch (err) {
    console.error(err);
  }
})();
