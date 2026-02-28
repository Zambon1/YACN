import fetch from 'node-fetch';

async function testSignup() {
    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                username: 'testuser123',
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
                confirmPassword: 'password123'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSignup();
