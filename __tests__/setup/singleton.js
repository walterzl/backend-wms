const { mockDeep, mockReset } = require('jest-mock-extended');
const mockPrisma = mockDeep();

beforeEach(() => {
  mockReset(mockPrisma);
});

module.exports = mockPrisma;
