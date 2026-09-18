const {test, expect} = require('@playwright/test');

// ============================================================
// API Tests - JSONPlaceholder
// Concepts: request fixture, GET, POST, PATCH, status codes
// ============================================================

//https://jsonplaceholder.typicode.com/posts/1
test('Get user by using get', async ({ request }) => {

    const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
    expect(response.status()).toBe(200);//200 means ok
    const body = await response.json();
    console.log(body);
});

test('create user using post', async ({ request }) => {
    const response = await request.post('https://jsonplaceholder.typicode.com/posts', {
        data: {
            title: 'playwright api testing',
            body: 'learning post request',
            userId: 1,
        },
    });
    expect(response.status()).toBe(201);//201 means created
    const body = await response.json();
    console.log(body);
});

test('update user using patch', async ({ request }) => {
    const response = await request.patch('https://jsonplaceholder.typicode.com/posts/1', {
        data: {
            title: 'updated title',
        },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    console.log(body);

});
