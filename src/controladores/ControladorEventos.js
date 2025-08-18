const ServicioEventos = require('../servicios/ServicioEventos');

/**
 * @class ControladorEventos
 * @description Controlador para manejar las conexiones de Server-Sent Events (SSE).
 */
class ControladorEventos {
  /**
   * @static
   * @description Establece y maneja una nueva conexión SSE con un cliente.
   * @param {object} req - El objeto de solicitud de Express.
   * @param {object} res - El objeto de respuesta de Express.
   */
  static conectar(req, res) {
    // 1. Establecer las cabeceras para la conexión SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    // Habilitar CORS para este endpoint específico si es necesario, aunque ya está global.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Enviar las cabeceras inmediatamente

    // 2. Agregar el cliente (el objeto `res`) al servicio de eventos
    const clienteId = ServicioEventos.agregarCliente(res);

    // 3. Enviar un evento de conexión inicial al cliente para confirmar
    const datosConexion = {
      mensaje: "Conexión SSE establecida exitosamente.",
      clienteId: clienteId,
      timestamp: new Date().toISOString()
    };
    res.write(`event: sse-conectado\ndata: ${JSON.stringify(datosConexion)}\n\n`);

    // 4. Manejar la desconexión del cliente
    req.on('close', () => {
      ServicioEventos.removerCliente(clienteId);
      res.end(); // Asegurarse de terminar la respuesta
    });
  }
}

module.exports = ControladorEventos;
