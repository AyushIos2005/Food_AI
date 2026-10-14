import { cleanIngredients, validateGenerate, validateLogin, validateOtp, validateRegister, validateReset } from '@/src/utils/validation';

describe('validateRegister', () => {
  const ok = { username: 'chef_01', name: 'Asha', email: 'asha@example.com', password: 'secret1' };
  it('accepts a valid form', () => expect(validateRegister(ok)).toEqual({}));
  it('rejects short usernames and bad characters', () => {
    expect(validateRegister({ ...ok, username: 'ab' }).username).toBeDefined();
    expect(validateRegister({ ...ok, username: 'bad name!' }).username).toBeDefined();
  });
  it('rejects invalid email and short password', () => {
    const e = validateRegister({ ...ok, email: 'nope', password: '123' });
    expect(e.email).toBeDefined();
    expect(e.password).toBeDefined();
  });
});

describe('validateLogin / validateOtp / validateReset', () => {
  it('requires identifier and password', () => {
    expect(validateLogin({ identifier: ' ', password: '' })).toEqual({ identifier: expect.any(String), password: expect.any(String) });
  });
  it('OTP must be exactly 6 digits', () => {
    expect(validateOtp({ otp: '12345' }).otp).toBeDefined();
    expect(validateOtp({ otp: '123456' })).toEqual({});
  });
  it('reset requires matching passwords', () => {
    expect(validateReset({ otp: '1234', newPassword: 'abcdef', confirmNewPassword: 'abcdeg' }).confirmNewPassword).toBeDefined();
    expect(validateReset({ otp: '1234', newPassword: 'abcdef', confirmNewPassword: 'abcdef' })).toEqual({});
  });
});

describe('cleanIngredients / validateGenerate', () => {
  it('trims, collapses spaces, dedupes case-insensitively', () => {
    expect(cleanIngredients(['  Chicken ', 'chicken', 'Egg  whites', ''])).toEqual(['Chicken', 'Egg whites']);
  });
  it('requires at least one ingredient and servings 1–50', () => {
    expect(validateGenerate({ ingredients: [], servings: 2, medical: '' }).ingredients).toBeDefined();
    expect(validateGenerate({ ingredients: ['tofu'], servings: 0, medical: '' }).servings).toBeDefined();
    expect(validateGenerate({ ingredients: ['tofu'], servings: 51, medical: '' }).servings).toBeDefined();
    expect(validateGenerate({ ingredients: ['tofu'], servings: 4, medical: '' })).toEqual({});
  });
});
