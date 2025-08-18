const { v4: uuidv4 } = require('uuid');

/**
 * @class ServicioEventos
 * @description Servicio para gestionar conexiones y envío de Server-Sent Events (SSE).
 * Se implementa como un Singleton para asegurar una única instancia en toda la aplicación.
 */
class ServicioEventos {
  constructor() {
    if (ServicioEventos.instance) {
      return ServicioEventos.instance;
    }
    // Usamos un Map para poder eliminar clientes de forma eficiente por su ID.
    this.clientes = new Map();
    console.log("✅ Servicio de Eventos (SSE) inicializado.");
    ServicioEventos.instance = this;
  }

  /**
   * Agrega un nuevo cliente (conexión SSE) a la lista de clientes activos.
   * @param {object} clienteRes - El objeto de respuesta (`res`) de Express.
   * @returns {string} El ID único asignado al cliente.
   */
  agregarCliente(clienteRes) {
    const clienteId = uuidv4();
    this.clientes.set(clienteId, clienteRes);
    console.log(`[SSE] Cliente conectado. ID: ${clienteId}. Clientes totales: ${this.clientes.size}`);
    return clienteId;
  }

  /**
   * Elimina un cliente de la lista de clientes activos.
   * @param {string} clienteId - El ID único del cliente a eliminar.
   */
  removerCliente(clienteId) {
    if (this.clientes.has(clienteId)) {
      this.clientes.delete(clienteId);
      console.log(`[SSE] Cliente desconectado. ID: ${clienteId}. Clientes totales: ${this.clientes.size}`);
    }
  }

  /**
   * Envía un evento a todos los clientes conectados.
   * @param {object} datos - El objeto de datos a enviar.
   * @param {string} [nombreEvento='notificacion'] - El nombre del evento SSE.
   */
  enviarEvento(datos, nombreEvento = 'notificacion') {
    if (this.clientes.size === 0) {
      // console.log("[SSE] No hay clientes conectados para enviar evento.");
      return;
    }

    const mensaje = `event: ${nombreEvento}\ndata: ${JSON.stringify(datos)}\n\n`;

    console.log(`[SSE] Enviando evento '${nombreEvento}' a ${this.clientes.size} cliente(s).`);

    this.clientes.forEach((clienteRes, id) => {
      try {
        clienteRes.write(mensaje);
      } catch (error) {
        console.error(`[SSE] Error al enviar evento al cliente ${id}:`, error);
        // Si hay un error (ej. socket cerrado), removemos al cliente.
        this.removerCliente(id);
      }
    });
  }
}

// Exportamos una única instancia (Singleton) del servicio.
const instancia = new ServicioEventos();
module.exports = instancia;
