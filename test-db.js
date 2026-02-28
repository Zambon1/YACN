import db from './utils/db.js';

async function testQuery() {
    try {
        console.log('Testing database query...');
        const result = await db.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
        console.log('Query successful!');
        console.log('Result rows:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('Found user:', result.rows[0].email);
        } else {
            console.log('No user found');
        }
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
    }
    process.exit(0);
}

testQuery();
