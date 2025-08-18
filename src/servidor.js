const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const configuracion = require("./configuracion/config");
const CONSTANTES = require("./configuracion/constantes");

// Importar middlewares
const middlewareAuth = require("./middleware/middlewareAuth");
const middlewareErrores = require("./middleware/middlewareErrores");
const middlewareLogs = require("./middleware/middlewareLogs");

// Importar controladores
const ControladorMantenedores = require("./controladores/ControladorMantenedores");

// Importar rutas
const rutasAuth = require("./rutas/rutasAuth");
const rutasMantenedores = require("./rutas/rutasMantenedores");
const rutasTrazabilidad = require("./rutas/rutasTrazabilidad");
const rutasInventario = require("./rutas/rutasInventario");
const rutasUsuarios = require("./rutas/rutasUsuarios");
const rutasReportes = require("./rutas/rutasReportes");
const rutasUtils = require("./rutas/rutasUtils");
const rutasOperacionesFrioDespacho = require("./rutas/rutasOperacionesFrioDespacho");
const rutasRecepcionesLotes = require("./rutas/rutasRecepcionesLotes");
const rutasStockUbicaciones = require("./rutas/rutasStockUbicaciones");
const rutasTarjas = require("./rutas/rutasTarjas");
const rutasEventos = require("./rutas/rutasEventos");

/**
 * Clase principal del servidor Express
 */
class Servidor {
  constructor() {
    this.app = express();
    this.puerto = configuracion.servidor.puerto;
    this.configurarMiddlewares();
    this.configurarRutas();
    this.configurarManejadorErrores();
  }

  /**
   * Configura los middlewares globales
   */
  configurarMiddlewares() {
    // Seguridad
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS
    this.app.use(
      cors({
        origin: configuracion.cors.origen,
        credentials: configuracion.cors.credentials,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposedHeaders: ["X-New-Token"], // Para renovación de tokens
      })
    );

    // Rate limiting
    const limitador = rateLimit({
      windowMs: configuracion.rateLimit.windowMs,
      max: configuracion.rateLimit.max,
      message: {
        exito: false,
        mensaje: configuracion.rateLimit.message,
        codigo: "LIMITE_EXCEDIDO",
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api", limitador);

    // Logging de requests
    if (configuracion.servidor.entorno === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Parse JSON bodies
    this.app.use(
      express.json({
        limit: "10mb",
        verify: (req, res, buf, encoding) => {
          req.rawBody = buf;
        },
      })
    );

    // Parse URL-encoded bodies
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "10mb",
      })
    );

    // Middleware personalizado para logs
    this.app.use(middlewareLogs.registrarRequest);

    // Headers de respuesta comunes
    this.app.use((req, res, next) => {
      res.setHeader("X-Powered-By", configuracion.aplicacion.nombre);
      res.setHeader("X-API-Version", configuracion.aplicacion.version);
      next();
    });
  }

  /**
   * Configura las rutas de la aplicación
   */
  configurarRutas() {
    // Ruta de salud básica (sin autenticación)
    this.app.get("/health", (req, res) => {
      res.json({
        exito: true,
        mensaje: "Servidor funcionando correctamente",
        timestamp: new Date().toISOString(),
        version: configuracion.aplicacion.version,
        entorno: configuracion.servidor.entorno,
      });
    });

    // Información básica del API (sin autenticación)
    this.app.get("/api", (req, res) => {
      res.json({
        exito: true,
        aplicacion: configuracion.aplicacion.nombre,
        version: configuracion.aplicacion.version,
        descripcion: configuracion.aplicacion.descripcion,
        documentacion: "/api/docs",
        endpoints: {
          auth: "/api/auth",
          mantenedores: "/api/mantenedores",
          trazabilidad: "/api/trazabilidad",
          inventario: "/api/inventario",
          reportes: "/api/reportes",
          usuarios: "/api/usuarios",
          utils: "/api/utils",
          operacionesFrioDespacho: "/api/operaciones-frio-despacho",
          recepcionesLotes: "/api/recepciones-lotes",
          stockUbicaciones: "/api/stock-ubicaciones",
          tarjas: "/api/tarjas",
          eventos: "/api/eventos",
        },
      });
    });

    // Rutas de autenticación (no requieren autenticación)
    this.app.use("/api/auth", rutasAuth);

    // Rutas utilitarias (algunas requieren autenticación)
    this.app.use("/api/utils", rutasUtils);

    // Rutas públicas de mantenedores (sin autenticación para datos maestros)
    this.app.get(
      "/api/mantenedores/plantas",
      ControladorMantenedores.obtenerPlantas
    );
    this.app.get(
      "/api/mantenedores/materiales",
      ControladorMantenedores.obtenerMateriales
    );
    this.app.get(
      "/api/mantenedores/proveedores",
      ControladorMantenedores.obtenerProveedores
    );
    this.app.get(
      "/api/mantenedores/ubicaciones",
      ControladorMantenedores.obtenerUbicaciones
    );
    this.app.get(
      "/api/mantenedores/temporadas",
      ControladorMantenedores.obtenerTemporadas
    );
    this.app.get(
      "/api/mantenedores/tipos-movimiento",
      ControladorMantenedores.obtenerTiposMovimiento
    );
    this.app.get(
      "/api/mantenedores/unidades-medida",
      ControladorMantenedores.obtenerUnidadesMedida
    );

    // Middleware de autenticación para las demás rutas
    this.app.use("/api", middlewareAuth.autenticar);
    this.app.use("/api", middlewareAuth.renovarSesionSiEsNecesario);
    this.app.use("/api", middlewareAuth.logearRequest);

    // Rutas protegidas (requieren autenticación)
    this.app.use("/api/mantenedores", rutasMantenedores);
    this.app.use("/api/trazabilidad", rutasTrazabilidad);
    this.app.use("/api/inventario", rutasInventario);
    this.app.use("/api/usuarios", rutasUsuarios);
    this.app.use("/api/reportes", rutasReportes);
    this.app.use(
      "/api/operaciones-frio-despacho",
      rutasOperacionesFrioDespacho
    );
    this.app.use("/api/recepciones-lotes", rutasRecepcionesLotes);
    this.app.use("/api/stock-ubicaciones", rutasStockUbicaciones);
    this.app.use("/api/tarjas", rutasTarjas);
    this.app.use("/api/eventos", rutasEventos);

    // Ruta para archivos estáticos (uploads, reportes, etc.)
    this.app.use("/uploads", express.static("uploads"));
    this.app.use("/temp", express.static("temp"));

    // Manejo de rutas no encontradas
    this.app.use("*", (req, res) => {
      res.status(CONSTANTES.CODIGOS_RESPUESTA.NO_ENCONTRADO).json({
        exito: false,
        mensaje: "Endpoint no encontrado",
        codigo: "ENDPOINT_NO_ENCONTRADO",
        path: req.originalUrl,
        metodo: req.method,
      });
    });
  }

  /**
   * Configura el manejo global de errores
   */
  configurarManejadorErrores() {
    this.app.use(middlewareErrores.manejarErrores);
    this.app.use(middlewareErrores.manejarErroresNoCapturados);
  }

  /**
   * Inicia el servidor
   */
  iniciar() {
    return new Promise((resolve, reject) => {
      try {
        const servidor = this.app.listen(this.puerto, () => {
          console.log(`
┌─────────────────────────────────────────────────────────────┐
│                    🍒 ${configuracion.aplicacion.nombre}                    │
├─────────────────────────────────────────────────────────────┤
│  Servidor iniciado exitosamente                            │
│  Puerto: ${this.puerto}                                              │
│  Entorno: ${
            configuracion.servidor.entorno
          }                                     │
│  Versión: ${
            configuracion.aplicacion.version
          }                                        │
│  Hora: ${new Date().toLocaleString("es-CL")}                   │
├─────────────────────────────────────────────────────────────┤
│  Endpoints disponibles:                                     │
│  • Health: http://localhost:${this.puerto}/health                  │
│  • API Info: http://localhost:${this.puerto}/api                   │
│  • Auth: http://localhost:${this.puerto}/api/auth                  │
│  • Mantenedores: http://localhost:${this.puerto}/api/mantenedores  │
│  • Trazabilidad: http://localhost:${this.puerto}/api/trazabilidad  │
│  • Inventario: http://localhost:${this.puerto}/api/inventario      │
└─────────────────────────────────────────────────────────────┘
          `);
          resolve(servidor);
        });

        // Manejo graceful de cierre del servidor
        process.on("SIGTERM", () => {
          console.log("\n🛑 Recibida señal SIGTERM. Cerrando servidor...");
          servidor.close(() => {
            console.log("✅ Servidor cerrado correctamente");
            process.exit(0);
          });
        });

        process.on("SIGINT", () => {
          console.log("\n🛑 Recibida señal SIGINT. Cerrando servidor...");
          servidor.close(() => {
            console.log("✅ Servidor cerrado correctamente");
            process.exit(0);
          });
        });
      } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
        reject(error);
      }
    });
  }

  /**
   * Obtiene la instancia de Express
   * @returns {Express} Instancia de Express
   */
  obtenerApp() {
    return this.app;
  }
}

module.exports = Servidor;

// Si este archivo se ejecuta directamente, iniciar el servidor
if (require.main === module) {
  const servidor = new Servidor();
  servidor.iniciar().catch((error) => {
    console.error("❌ Error crítico al iniciar servidor:", error);
    process.exit(1);
  });
}
