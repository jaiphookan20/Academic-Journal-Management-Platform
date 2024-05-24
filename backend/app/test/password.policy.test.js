// isInteger.spec.js
const {is_valid_password} = require("../utilities/validate");

const test_passwords = [
    'testing',
    'testing124',
    'hello',
    'Hdj@99sDD!',
    'maskdoo222',
    'okd22@@ddd',
    'dsasddjjiD@',
    'assd2D@'
];

const test_results = [false,false,false,true,false,false,false,false];

test_passwords.forEach((password, index) => {
    test(`checks if password "${password}" is valid or not`, () => {
        expect(is_valid_password(password)).toBe(test_results[index]);
    });
});