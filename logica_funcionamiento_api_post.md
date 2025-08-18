# Lógica de Funcionamiento - Módulos WMS Trazabilidad

## Introducción

Este documento describe la lógica de funcionamiento de cada módulo del sistema WMS de trazabilidad, incluyendo los flujos de datos, operaciones de stock y reglas de negocio basadas en el nuevo modelo de base de datos con tablas especializadas.

---

## Módulo 3.3: Inventario

### Objetivo

Registrar inventario físico de materiales en ubicaciones específicas para control de stock.

### Lógica de Funcionamiento

#### Al Guardar Inventario:

1. **Validaciones Iniciales**

   - Verificar que todos los campos obligatorios estén completos
   - Validar que el material existe en la tabla `materiales`
   - Validar que la ubicación existe en la tabla `ubicacion`
   - Verificar que el usuario tiene permisos para la planta seleccionada

2. **Proceso de Guardado**

   ```sql
   -- Insertar registro en tabla inventario
   INSERT INTO inventario (
       planta, title, nombre_material, unidad_medida, cod_nombre,
       fecha_inventario, pallets, stock, bodega, ubicacion, lote,
       condicion_armado, contado_por, material_id, ubicacion_id, usuario_id
   ) VALUES (...)
   ```

3. **Actualización de Stock (Opcional)**

   - Si existe tabla `stock_ubicaciones`, actualizar o crear registro:

   ```sql
   -- Actualizar stock consolidado
   INSERT INTO stock_ubicaciones (
       material_id, codigo_material, nombre_material, ubicacion_id,
       planta, bodega, ubicacion_nombre, lote, cantidad_actual,
       fecha_ultimo_movimiento
   ) VALUES (...)
   ON CONFLICT (material_id, ubicacion_id, lote)
   DO UPDATE SET
       cantidad_actual = EXCLUDED.cantidad_actual,
       fecha_ultimo_movimiento = CURRENT_TIMESTAMP
   ```

4. **Registro de Auditoría**
   - Crear log en `logs_sistema` con la acción realizada
   - Registrar datos del inventario para trazabilidad

### Campos Clave

- **Entrada**: Material, ubicación, cantidad, lote, contado por
- **Salida**: Registro de inventario, actualización de stock consolidado

---

## Módulo 3.4: Trazabilidad

### Objetivo

Generar movimientos de materiales entre ubicaciones manteniendo trazabilidad completa.

### Lógica de Funcionamiento

#### Al Agregar Movimiento:

1. **Validaciones de Negocio**

   - Verificar existencia de material en tabla `materiales`
   - Validar ubicaciones origen y destino en tabla `ubicacion`
   - Verificar que el tipo de movimiento existe en `tipo_movimientos_app`
   - Validar stock disponible en ubicación origen (si aplica)

2. **Cálculo de Stock**

   ```sql
   -- Para movimientos que afectan stock
   CASE tipo_movimiento
       WHEN 'Despacho' THEN
           -- Restar de ubicación origen
           UPDATE stock_ubicaciones
           SET cantidad_actual = cantidad_actual - :cantidad
           WHERE material_id = :material_id AND ubicacion_id = :ubicacion_origen_id

       WHEN 'Recepción' THEN
           -- Sumar a ubicación destino
           INSERT INTO stock_ubicaciones (...)
           ON CONFLICT DO UPDATE SET cantidad_actual = cantidad_actual + :cantidad

       WHEN 'Transferencia' THEN
           -- Restar origen, sumar destino
           -- (Operación atómica)
   END CASE
   ```

#### Al Guardar Movimientos:

1. **Proceso Transaccional**

   ```sql
   BEGIN TRANSACTION;

   -- Insertar en trazabilidad_materiales_r9
   INSERT INTO trazabilidad_materiales_r9 (
       tipo_movimiento, planta, guia_sii, fecha, mes, id_movimiento,
       proveedor, lote, title, nombre, cod_nombre, clasificacion,
       total_pallet, cantidad, unidad_medida, bod_origen, bod_destino,
       ubicacion_origen, ubicacion_destino, turno, temporada,
       observacion, bodega_stock, ubicacion_stock, total_stock,
       material_id, proveedor_id, ubicacion_origen_id, ubicacion_destino_id,
       temporada_id, tipo_movimiento_id
   ) VALUES (...);

   -- Actualizar stock_ubicaciones según tipo de movimiento
   -- (Ver lógica de cálculo arriba)

   COMMIT;
   ```

2. **Generación de ID Único**
   - Formato: `{PLANTA}_{TIPO_MOV}_{FECHA}_{SECUENCIAL}`
   - Ejemplo: `RAN_DESP_20241117_001`

### Reglas de Stock

- **Despacho**: Resta stock de ubicación origen
- **Recepción**: Suma stock a ubicación destino
- **Transferencia**: Resta origen, suma destino
- **Consumo**: Resta stock sin ubicación destino
- **Ajuste**: Ajusta stock según diferencia

---

## Módulo 3.5: Recepción Lotes

### Objetivo

Agilizar recepciones internas con código QR y control específico de lotes.

### Lógica de Funcionamiento

#### Al Escanear QR:

1. **Decodificación QR**
   - Extraer información del código QR (material, lote, cantidad, etc.)
   - Validar formato y completitud de datos
   - Autocompletar campos del formulario

#### Al Guardar Recepción:

1. **Validaciones Específicas**

   ```sql
   -- Verificar proveedor
   SELECT id FROM proveedores WHERE id = :proveedor_id AND activo = true

   -- Verificar material
   SELECT id FROM materiales WHERE id = :material_id AND activo = true

   -- Verificar ubicación destino
   SELECT id FROM ubicacion WHERE id = :ubicacion_destino_id AND activo = true
   ```

2. **Proceso de Guardado**

   ```sql
   BEGIN TRANSACTION;

   -- Insertar en recepciones_lotes
   INSERT INTO recepciones_lotes (
       numero_recepcion, planta, fecha_recepcion, proveedor_id,
       nombre_proveedor, guia_sii, material_id, codigo_material,
       nombre_material, cod_nombre, unidad_medida, clasificacion,
       lote, cantidad, pallets, codigo_qr, ubicacion_destino_id,
       bodega_destino, ubicacion_destino, estado, observaciones,
       usuario_id
   ) VALUES (...);

   -- Actualizar stock en ubicación destino
   INSERT INTO stock_ubicaciones (
       material_id, codigo_material, nombre_material, ubicacion_id,
       planta, bodega, ubicacion_nombre, lote, cantidad_actual,
       fecha_ultimo_movimiento
   ) VALUES (...)
   ON CONFLICT (material_id, ubicacion_id, lote)
   DO UPDATE SET
       cantidad_actual = cantidad_actual + EXCLUDED.cantidad_actual,
       fecha_ultimo_movimiento = CURRENT_TIMESTAMP;

   -- Crear movimiento en trazabilidad
   INSERT INTO trazabilidad_materiales_r9 (
       tipo_movimiento, id_movimiento, planta, fecha,
       proveedor, lote, title, nombre, cantidad,
       bod_destino, ubicacion_destino, bodega_stock,
       ubicacion_stock, total_stock, guia_sii
   ) VALUES (
       'Recepción Lotes',
       'REC_' || :numero_recepcion,
       :planta, :fecha_recepcion, :nombre_proveedor,
       :lote, :codigo_material, :nombre_material, :cantidad,
       :bodega_destino, :ubicacion_destino, :bodega_destino,
       :ubicacion_destino, :cantidad, :guia_sii
   );

   COMMIT;
   ```

3. **Actualización de Estado**
   - Estado inicial: `'pendiente'`
   - Al procesar: `'procesada'`
   - Si hay error: `'cancelada'`

### Campos Específicos

- **codigo_qr**: Almacena el código QR completo
- **numero_recepcion**: Generado automáticamente
- **pallets**: Cantidad de pallets recibidos

---

## Módulo 3.6: Frío y Despacho

### Objetivo

Mantener trazabilidad específica de materiales en sector frío con datos de embarque.

### Lógica de Funcionamiento

#### Al Consumir/Despachar Material:

1. **Validaciones Específicas**

   ```sql
   -- Verificar stock disponible para consumo
   SELECT cantidad_actual
   FROM stock_ubicaciones
   WHERE material_id = :material_id
     AND ubicacion_id = :ubicacion_origen_id
     AND lote = :lote
     AND cantidad_actual >= :cantidad_solicitada
   ```

2. **Proceso según Tipo de Operación**

   **Para CONSUMO:**

   ```sql
   BEGIN TRANSACTION;

   -- Insertar operación
   INSERT INTO operaciones_frio_despacho (
       numero_operacion, planta, fecha_operacion, tipo_operacion,
       turno, material_id, codigo_material, nombre_material,
       cod_nombre, unidad_medida, clasificacion, lote, cantidad,
       ubicacion_origen_id, bodega_origen, ubicacion_origen,
       estado, observaciones, usuario_id
   ) VALUES (...);

   -- Restar stock de origen
   UPDATE stock_ubicaciones
   SET cantidad_actual = cantidad_actual - :cantidad,
       fecha_ultimo_movimiento = CURRENT_TIMESTAMP
   WHERE material_id = :material_id
     AND ubicacion_id = :ubicacion_origen_id
     AND lote = :lote;

   -- Registrar en trazabilidad
   INSERT INTO trazabilidad_materiales_r9 (
       tipo_movimiento, id_movimiento, planta, fecha, turno,
       title, nombre, cantidad, lote, bod_origen, ubicacion_origen,
       bodega_stock, ubicacion_stock, total_stock
   ) VALUES (
       'Consumo Frío', 'FRIO_' || :numero_operacion, ...
   );

   COMMIT;
   ```

   **Para DESPACHO:**

   ```sql
   -- Similar al consumo pero incluye:
   -- numero_embarque, patente_camion, ubicacion_destino
   -- Y registra movimiento completo origen->destino
   ```

3. **Generación de Número de Operación**
   - Formato: `FRIO_{PLANTA}_{FECHA}_{SECUENCIAL}`
   - Ejemplo: `FRIO_RAN_20241117_001`

### Campos Específicos del Módulo

- **numero_embarque**: Para despachos externos
- **patente_camion**: Identificación del transporte
- **turno**: Control por turnos de trabajo
- **tipo_operacion**: 'consumo' o 'despacho'

---

## Módulo 3.7: Tarjas CAA

### Objetivo

Generar e imprimir tarjas CAA para control de materiales.

### Lógica de Funcionamiento

#### Al Generar Tarja:

1. **Validaciones**

   - Verificar que la descripción no esté vacía
   - Validar materiales seleccionados
   - Verificar datos de lote, cantidad, número y fecha

2. **Proceso de Generación**

   ```sql
   -- Generar número de tarja único
   SELECT COALESCE(MAX(CAST(SUBSTRING(numero_tarja FROM 4) AS INTEGER)), 0) + 1
   FROM tarjas
   WHERE tipo_tarja = 'CAA'
     AND planta = :planta
     AND fecha_generacion = CURRENT_DATE;

   -- Insertar tarja
   INSERT INTO tarjas (
       numero_tarja, planta, fecha_generacion, tipo_tarja,
       descripcion, material_id, codigo_material, nombre_material,
       lote, cantidad, numero_item, fecha_item, estado, usuario_id
   ) VALUES (
       'CAA' || LPAD(:secuencial::text, 6, '0'),
       :planta, CURRENT_DATE, 'CAA', :descripcion,
       :material_id, :codigo_material, :nombre_material,
       :lote, :cantidad, :numero_item, :fecha_item,
       'generada', :usuario_id
   );
   ```

3. **Control de Impresión**
   - Estado inicial: `'generada'`
   - Al imprimir: `'impresa'` + timestamp
   - Si se anula: `'anulada'`

### Campos Específicos

- **tipo_tarja**: Siempre 'CAA'
- **numero_item**: Número secuencial en la tarja
- **fecha_item**: Fecha específica del item
- **descripcion**: Descripción libre de la tarja

---

## Módulo 3.8: Tarjas Bodega

### Objetivo

Generar e imprimir tarjas de bodega con información de proveedores.

### Lógica de Funcionamiento

#### Al Generar Tarja Bodega:

1. **Validaciones Adicionales**

   - Verificar proveedor seleccionado
   - Validar número de guía
   - Confirmar todos los campos requeridos

2. **Proceso de Generación**
   ```sql
   -- Similar a tarjas CAA pero incluye datos de proveedor
   INSERT INTO tarjas (
       numero_tarja, planta, fecha_generacion, tipo_tarja,
       descripcion, material_id, codigo_material, nombre_material,
       lote, cantidad, numero_item, fecha_item,
       proveedor_id, nombre_proveedor, guia,
       estado, usuario_id
   ) VALUES (
       'BOD' || LPAD(:secuencial::text, 6, '0'),
       :planta, CURRENT_DATE, 'BODEGA', :descripcion,
       :material_id, :codigo_material, :nombre_material,
       :lote, :cantidad, :numero_item, :fecha_item,
       :proveedor_id, :nombre_proveedor, :guia,
       'generada', :usuario_id
   );
   ```

### Campos Específicos Adicionales

- **tipo_tarja**: Siempre 'BODEGA'
- **proveedor_id**: Referencia al proveedor
- **nombre_proveedor**: Nombre del proveedor
- **guia**: Número de guía del proveedor

---

## Reglas Generales del Sistema

### Control de Stock

1. **Stock Consolidado**: La tabla `stock_ubicaciones` mantiene el stock actual por material/ubicación/lote
2. **Movimientos Atómicos**: Todas las operaciones de stock se realizan en transacciones
3. **Trazabilidad Completa**: Cada movimiento se registra en `trazabilidad_materiales_r9`

### Auditoría y Logs

- Todos los módulos registran actividad en `logs_sistema`
- Se mantiene historial de cambios con datos anteriores y nuevos
- Registro de IP y usuario para cada operación

### Estados y Flujos

- **Pendiente**: Registro creado pero no procesado
- **Procesado/Procesada**: Operación completada exitosamente
- **Cancelado/Cancelada**: Operación anulada
- **Generada**: Para tarjas recién creadas
- **Impresa**: Para tarjas ya impresas

### Validaciones Transversales

1. **Usuarios**: Verificar permisos por planta
2. **Materiales**: Validar que estén activos
3. **Ubicaciones**: Confirmar que pertenecen a la planta correcta
4. **Stock**: Verificar disponibilidad antes de movimientos de salida

---

## Consideraciones Técnicas

### Performance

- Índices optimizados para consultas frecuentes por fecha, material y planta
- Vistas materializadas para reportes consolidados
- Particionado por fecha en tablas de alto volumen

### Integridad de Datos

- Constraints de foreign key para mantener integridad referencial
- Triggers para actualización automática de timestamps
- Validaciones a nivel de base de datos para reglas críticas

### Escalabilidad

- Diseño modular permite agregar nuevos tipos de movimientos
- Estructura flexible para nuevas plantas o ubicaciones
- Separación clara entre datos transaccionales y maestros
