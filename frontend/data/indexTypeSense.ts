import Typesense from 'typesense';
import UsersData from './users.json';

(async () => {
    const typesense = new Typesense.Client({
        apiKey: process.env.TYPESENSE_ADMIN_API_KEY || 'xyz',
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
                type: 'int32',
            },
            {
                name: 'email',
                type: 'string',
            },
        ],
    });

    console.log('Populating collection...');

    try {
        const returnData = await typesense
            .collections('users')
            .documents()
            .import(UsersData);

        console.log('Return data: ', returnData);
    } catch (err) {
        console.error(err);
    }
})();