const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = a= require('jsonwebtoken');
const Servidor = require('../../src/servidor');
const mockPrisma = require('../setup/singleton');

// Mockear el cliente Prisma centralizado
jest.mock('../../src/configuracion/prismaClient', () => require('../setup/singleton'));

// Mockear otras dependencias externas
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Rutas de Autenticación - /api/auth', () => {
  let app;

  beforeEach(() => {
    const servidor = new Servidor();
    app = servidor.obtenerApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {

    it('debería iniciar sesión y retornar un token con credenciales válidas', async () => {
      // --- Preparación del Mock ---
      const mockUser = {
        id: 1,
        usuario: 'testuser',
        email: 'test@test.com',
        password_hash: 'hashedpassword',
        nombre_completo: 'Test User',
        rol: 'operador',
        planta_asignada: 'RANCAGUA',
        activo: true,
        ultimo_acceso: null,
      };

      const mockSession = {
        id: 101,
        usuario_id: mockUser.id,
        token_jwt: 'mock_token',
        activa: true,
      };

      // Mockear la búsqueda de usuario
      mockPrisma.usuarios.findFirst.mockResolvedValue(mockUser);
      // Mockear la comparación de contraseñas
      bcrypt.compare.mockResolvedValue(true);
      // Mockear la creación de sesión
      mockPrisma.sesionesUsuario.create.mockResolvedValue(mockSession);
      // Mockear la actualización de último acceso (no retorna nada importante)
      mockPrisma.usuarios.update.mockResolvedValue({});
      // Mockear la creación de log (no retorna nada importante)
      mockPrisma.logsSistema.create.mockResolvedValue({});
       // Mockear la busqueda de sesiones activas
       mockPrisma.sesionesUsuario.findMany.mockResolvedValue([]);
      // Mockear la generación del token
      jwt.sign.mockReturnValue('mock_jwt_token');


      // --- Ejecución ---
      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'testuser', password: 'password123' });

      // --- Aserciones ---
      expect(response.status).toBe(200);
      expect(response.body.exito).toBe(true);
      expect(response.body.mensaje).toBe('Inicio de sesión exitoso');
      expect(response.body.datos).toHaveProperty('token');
      expect(response.body.datos.token).toBe('mock_jwt_token');
      expect(response.body.datos.usuario.nombreCompleto).toBe('Test User');

      // Verificar que se llamaron los mocks correctos
      expect(mockPrisma.usuarios.findFirst).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password_hash);
      expect(mockPrisma.sesionesUsuario.create).toHaveBeenCalledTimes(1);
    });

    it('debería retornar error 401 con contraseña incorrecta', async () => {
      const mockUser = {
        id: 1,
        password_hash: 'hashedpassword',
        activo: true,
      };

      mockPrisma.usuarios.findFirst.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // La contraseña no coincide

      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.exito).toBe(false);
      expect(response.body.codigo).toBe('CREDENCIALES_INVALIDAS');
    });

    it('debería retornar error 401 si el usuario no existe', async () => {
      mockPrisma.usuarios.findFirst.mockResolvedValue(null); // Usuario no encontrado

      const response = await request(app)
        .post('/api/auth/login')
        .send({ usuario: 'nouser', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.exito).toBe(false);
      expect(response.body.codigo).toBe('CREDENCIALES_INVALIDAS');
    });

    it('debería retornar error 401 si el usuario está inactivo', async () => {
        const mockUser = {
            id: 1,
            activo: false, // Usuario inactivo
        };

        mockPrisma.usuarios.findFirst.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/api/auth/login')
            .send({ usuario: 'inactiveuser', password: 'password123' });

        expect(response.status).toBe(401);
        expect(response.body.exito).toBe(false);
        expect(response.body.codigo).toBe('USUARIO_DESACTIVADO');
    });

  });
});
