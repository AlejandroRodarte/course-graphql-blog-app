import { getFirstName, isValidPassword } from '../src/utils/user';

// test function to create a unit test
// expect function to kickstart an assertion
// toBe method checks for equality between two variables
test('Should return first name when given full name.', () => {
    const firstName = getFirstName('Alejandro Rodarte');
    expect(firstName).toBe('Alejandro');
});

test('Should return first name when given first name.', () => {
    const firstName = getFirstName('Jennifer');
    expect(firstName).toBe('Jennifer');
});

test('Should reject password shorter than 8 characters.', () => {
    const isValid = isValidPassword('yolo');
    expect(isValid).toBe(false);
});

test('Shoud reject password that contains the word password.', () => {
    const isValid = isValidPassword('myrealpassworD');
    expect(isValid).toBe(false);
});

test('Should correctly validate a valid password.', () => {
    const isValid = isValidPassword('pepenator124');
    expect(isValid).toBe(true);
});