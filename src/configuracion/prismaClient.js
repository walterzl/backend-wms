// Centraliza la instancia de PrismaClient para ser usada en toda la aplicación.
// Esto facilita el mocking en las pruebas.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
