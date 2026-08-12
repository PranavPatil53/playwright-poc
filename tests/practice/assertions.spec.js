const {test,expect} = require('@playwright/test');
test("my first test",async function({page})
{
 expect(12).toBe(12)
})

test("my second test",async function({page})
{
 expect(100).toBe(101)
})

test("my third test",async function({page})
{
    expect(2.0).toBe(2.0)
})

test("my fourth test",async function({page})
{
    expect("Pranav").toContain("Pranav")
    expect(true).toBeTruthy()
})

test("my fifth test",async function({page})
{
    expect(false).toBeFalsy()
})
