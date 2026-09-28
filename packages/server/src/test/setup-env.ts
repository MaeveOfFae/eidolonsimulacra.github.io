// Deterministic environment for unit tests.
//
// `dotenv` (loaded by src/env.ts) does not override existing process.env values,
// so these assignments win over any local `.env`, and they keep the server tests
// runnable in CI where no `.env` file is present.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://user:pass@127.0.0.1:5432/eidolon_test';
process.env.JWT_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.JWT_REFRESH_SECRET = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
process.env.ENCRYPTION_KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
