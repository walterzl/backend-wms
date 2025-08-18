# Guía de Integración Frontend para Server-Sent Events (SSE)

Este documento proporciona las instrucciones para conectar una aplicación frontend (por ejemplo, React con Next.js) al backend y consumir los eventos en tiempo real a través de Server-Sent Events (SSE) usando la librería SWR.

## 1. Prerrequisitos

- Un proyecto frontend configurado (React, Next.js, etc.).
- La librería `swr` instalada. Si no la tienes, instálala con `npm install swr` o `yarn add swr`.
- Un mecanismo para obtener y almacenar el token de autenticación (JWT) después de que el usuario inicie sesión.

## 2. Conexión al Endpoint SSE con `EventSource`

El backend expone el siguiente endpoint para establecer una conexión SSE:
- **Endpoint:** `GET /api/eventos/conectar`
- **Autenticación:** Requiere un token JWT válido en la cabecera `Authorization`.

La API nativa de JavaScript `EventSource` no permite configurar cabeceras HTTP directamente. Para solucionar esto, la forma más sencilla es usar una librería que actúe como polyfill y permita enviar cabeceras. Una muy popular es `@microsoft/fetch-event-source`.

**Instalación:**
```bash
npm install @microsoft/fetch-event-source
```

## 3. Integración con SWR y un Hook Personalizado (`useSSE`)

La mejor manera de integrar SSE con SWR es crear un hook personalizado que maneje el ciclo de vida de la conexión.

Aquí tienes un ejemplo de un hook `useSSE.js` usando `@microsoft/fetch-event-source`:

```javascript
import useSWR from 'swr';
import { useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// Este es el "fetcher" para SWR. La clave 'key' será la URL del endpoint.
// No necesitamos un fetcher tradicional, ya que la conexión se gestionará en el `useEffect`.
const useSSE = (key, { onData, onError }) => {
  useEffect(() => {
    let ctrl = new AbortController();

    const connect = async () => {
      // Obtener el token de autenticación (ej: desde localStorage)
      const token = localStorage.getItem('jwt_token');

      await fetchEventSource(key, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: ctrl.signal,

        onopen(res) {
          if (res.ok && res.status === 200) {
            console.log("Conexión SSE establecida");
          } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
            console.error("Error del cliente al conectar SSE:", res.status);
            // Si hay un error de cliente (ej: 401 Unauthorized), cancelamos la conexión.
            ctrl.abort();
            if (onError) onError(new Error(`Error del cliente: ${res.status}`));
          }
        },

        onmessage(event) {
          // El nombre del evento ('notificacion', 'sse-conectado') debe coincidir con el que envía el backend.
          if (event.event === 'sse-conectado') {
            console.log("Evento de conexión recibido:", JSON.parse(event.data));
            return;
          }

          try {
            const parsedData = JSON.parse(event.data);
            if (onData) {
              onData(parsedData, event.event); // Pasamos también el nombre del evento
            }
          } catch (e) {
            console.error('Error al parsear el evento SSE:', e);
          }
        },

        onclose() {
          console.log("Conexión SSE cerrada por el servidor.");
        },

        onerror(err) {
          console.error("Error en la conexión EventSource:", err);
          if (onError) onError(err);
          // La librería reintentará la conexión automáticamente, no es necesario abortar aquí.
          throw err; // Es importante lanzar el error para que la librería gestione los reintentos.
        },
      });
    };

    connect();

    // Limpieza: abortamos la conexión si el componente se desmonta.
    return () => {
      ctrl.abort();
    };
  }, [key, onData, onError]);
};

export default useSSE;
```

## 4. Implementación en un Componente React

Ahora puedes usar el hook `useSSE` en tus componentes para recibir y mostrar datos en tiempo real.

```jsx
import React, { useState, useEffect } from 'react';
import useSSE from './useSSE'; // Ajusta la ruta a tu hook

function NotificacionesEnTiempoReal() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // URL del endpoint SSE
  const sseUrl = 'http://localhost:8080/api/eventos/conectar'; // Reemplaza con la URL de tu API

  useSSE(sseUrl, {
    // Esta función se llamará cada vez que llegue un nuevo evento
    onData: (data, eventName) => {
      setIsConnected(true);
      console.log(`Nuevo evento '${eventName}' recibido:`, data);
      setNotificaciones((prev) => [...prev, { ...data, tipo: eventName, id: Date.now() }]);
    },
    // Manejo de errores de conexión
    onError: (err) => {
      setIsConnected(false);
      setError('No se pudo conectar al servicio de eventos.');
      console.error('La conexión SSE falló:', err);
    },
  });

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Notificaciones en Tiempo Real</h1>
      <p>Estado de la conexión: {isConnected ? 'Conectado' : 'Desconectado'}</p>

      <h2>Últimas Notificaciones:</h2>
      {notificaciones.length === 0 && <p>Esperando notificaciones...</p>}
      <ul>
        {notificaciones.map((notif) => (
          <li key={notif.id}>
            <strong>{notif.tipo}:</strong> {notif.mensaje || JSON.stringify(notif)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificacionesEnTiempoReal;
```

## 5. Probar la Implementación

Para probar que todo funciona, puedes enviar un evento desde el backend usando el endpoint de prueba. Abre una terminal y usa `curl` (o una herramienta como Postman/Insomnia):

```bash
curl -X POST http://localhost:8080/api/eventos/notificar \
-H "Content-Type: application/json" \
-H "Authorization: Bearer TU_TOKEN_JWT" \
-d '{
    "evento": "notificacion",
    "datos": {
        "titulo": "Nuevo Material Recibido",
        "mensaje": "Se ha recibido el material MP-00123 en la planta de Rancagua."
    }
}'
```

Reemplaza `TU_TOKEN_JWT` con un token válido. Deberías ver la nueva notificación aparecer instantáneamente en tu componente React.
