const {is_valid_email} = require("../utilities/validate");

const test_emails = [
    'test',
    'test@gmail.com',
    'testgamil.com',
    'mask@yahoo.com',
    'Asciiii@',
    'ronaldo@alnassar.com',
    'bruno@manunited',
    'bestiii123#aaa'
];

const test_results = [false,true,false,true,false,true,false,false];

test_emails.forEach((email, index) => {
    test(`checks if email "${email}" is valid or not`, () => {
        expect(is_valid_email(email)).toBe(test_results[index]);
    });
});