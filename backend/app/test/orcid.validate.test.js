const { is_valid_orcid } = require("../utilities/validate");

const test_orcids = [
    "0000-0000-0000-0001",
    "1234-5678-9012-3453",
    "0000-0000-0000-001",
    "0000-0000-0000",
    "0000-0000-0000-000Z",
];

const test_results = [true,true,false,false, false];

test_orcids.forEach((orcid, index) => {
    test(`checks if ORCiD "${orcid}" is valid or not`, () => {
        expect(is_valid_orcid(orcid)).toBe(test_results[index]);
    });
});

