import db from '../config/db.js';
import * as VentaModel from '../models/venta.model.js';
import * as VentaAsientoModel from '../models/venta_asiento.model.js';
import * as PagoModel from '../models/pago.model.js';
import * as FacturaModel from '../models/factura.model.js';
import * as FacturaDetalleModel from '../models/factura_detalle.model.js';
import { getVentasPorDia } from '../models/venta_asiento.model.js';

class VentaService {

    async procesarCompraCompleta(compraData) {
        console.log('=== SERVICIO: PROCESANDO COMPRA COMPLETA ===');
        console.log('Datos de compra:', compraData);

        const client = await db.connect();
        console.log('Conexión a base de datos establecida');

        try {
            await client.query('BEGIN');
            console.log('Transacción iniciada');

            const {
                firebase_uid,
                funcion_id,
                asientos,
                metodo_pago_id,
                transaccion_id,
                // Nuevos campos para descuentos
                promocion_aplicada,
                descuento_aplicado,
                codigo_cupon
            } = compraData;

            // Calcular totales básicos
            const subtotal = asientos.reduce((sum, asiento) => sum + asiento.precio_asiento, 0);
            const iva = subtotal * 0.12; // Corregido: 12% en lugar de 19%
            const total = subtotal + iva;

            // Calcular total final con descuentos
            const descuentoFinal = descuento_aplicado || 0;
            const totalFinal = total - descuentoFinal;

            console.log('Totales calculados:', { 
                subtotal, 
                iva, 
                total, 
                descuento_aplicado: descuentoFinal,
                total_final: totalFinal 
            });

            // 1. Crear la venta
            const ventaData = {
                firebase_uid,
                funcion_id,
                total_asientos: asientos.length,
                subtotal,
                iva,
                total: totalFinal, // total ya incluye el descuento aplicado
                estado: 'pendiente',
                // Incluir campos de descuento
                promocion_id: promocion_aplicada || null,
                codigo_cupon: codigo_cupon || null,
                descuento_aplicado: descuentoFinal
            };

            console.log('Creando venta con datos:', ventaData);
            const venta = await VentaModel.create(ventaData);
            console.log('Venta creada:', venta);

            // 1.1. Registrar promoción aplicada en historial (si aplica)
            if (promocion_aplicada && descuentoFinal > 0) {
                try {
                    await this.registrarPromocionAplicada(venta.id_venta, promocion_aplicada, codigo_cupon, descuentoFinal);
                    console.log('Promoción registrada en historial');
                } catch (error) {
                    console.warn('Error registrando promoción en historial:', error.message);
                    // No fallar la venta por esto
                }
            }

            // 2. Crear asientos de la venta
            console.log('Creando asientos de venta...');
            const ventaAsientos = await VentaAsientoModel.createMultiple(venta.id_venta, asientos, funcion_id);
            console.log('Asientos creados:', ventaAsientos);

            // 3. Crear el pago
            const pagoData = {
                venta_id: venta.id_venta,
                metodo_pago_id,
                monto: total,
                estado: 'completado',
                transaccion_id
            };

            console.log('Creando pago con datos:', pagoData);
            const pago = await PagoModel.create(pagoData);
            console.log('Pago creado:', pago);

            // 4. Generar número de factura
            console.log('Generando número de factura...');
            const numeroFactura = await FacturaModel.generateNumeroFactura();
            console.log('Número de factura generado:', numeroFactura);

            // 4.1. Obtener datos de la función para la factura
            console.log('Obteniendo datos de la función para la factura...');
            const funcionQuery = `
                SELECT 
                    f.fecha_hora_inicio,
                    f.fecha_hora_fin,
                    p.titulo as pelicula_titulo,
                    s.nombre as sala_nombre,
                    i.nombre as idioma
                FROM funciones f
                JOIN peliculas p ON f.id_pelicula = p.id_pelicula
                JOIN salas s ON f.id_sala = s.id_sala
                JOIN idiomas i ON f.id_idioma = i.id_idioma
                WHERE f.id_funcion = $1
            `;
            const funcionResult = await db.query(funcionQuery, [funcion_id]);
            const funcionData = funcionResult.rows[0];

            // 4.2. Obtener datos del usuario de Firebase
            let datosUsuario = {
                nombre: 'Cliente',
                email: 'cliente@email.com',
                telefono: '0000000000'
            };
            
            try {
                const admin = await import('firebase-admin');
                const usuarioFirebase = await admin.default.auth().getUser(firebase_uid);
                datosUsuario = {
                    nombre: usuarioFirebase.displayName || usuarioFirebase.email?.split('@')[0] || 'Cliente',
                    email: usuarioFirebase.email || 'cliente@email.com',
                    telefono: usuarioFirebase.phoneNumber || '0000000000'
                };
                console.log('Datos del usuario obtenidos de Firebase:', datosUsuario);
            } catch (error) {
                console.warn('Error obteniendo datos de Firebase, usando valores por defecto:', error.message);
            }

            // 5. Crear la factura con datos reales
            const facturaData = {
                venta_id: venta.id_venta,
                numero_factura: numeroFactura,
                // Datos del cliente obtenidos de Firebase
                cliente_nombre: datosUsuario.nombre,
                cliente_email: datosUsuario.email,
                cliente_telefono: datosUsuario.telefono,
                // Datos de la función obtenidos de la BD
                pelicula_titulo: funcionData?.pelicula_titulo || 'Película',
                sala_nombre: funcionData?.sala_nombre || 'Sala',
                fecha_funcion: funcionData?.fecha_hora_inicio ? new Date(funcionData.fecha_hora_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                hora_inicio: funcionData?.fecha_hora_inicio ? new Date(funcionData.fecha_hora_inicio).toTimeString().split(' ')[0] : '00:00:00',
                hora_fin: funcionData?.fecha_hora_fin ? new Date(funcionData.fecha_hora_fin).toTimeString().split(' ')[0] : '02:00:00',
                idioma: funcionData?.idioma || 'Español',
                // Datos financieros
                subtotal,
                iva_valor: iva, // Usar el nombre correcto del campo en BD
                total: totalFinal, // total final con descuento aplicado
                estado: 'emitida',
                // Incluir información de descuentos
                promocion_aplicada: promocion_aplicada ? `Promoción ID: ${promocion_aplicada}` : null,
                codigo_cupon_usado: codigo_cupon || null,
                descuento_aplicado: descuentoFinal
            };

            console.log('Creando factura con datos:', facturaData);
            const factura = await FacturaModel.create(facturaData);
            console.log('Factura creada:', factura);

            // 6. Crear detalles de la factura con información de asientos
            console.log('Obteniendo información detallada de asientos...');
            const asientosDetallados = await Promise.all(
                asientos.map(async (asiento) => {
                    try {
                        const asientoQuery = `
                            SELECT a.fila, a.columna, a.id_asiento
                            FROM asientos a
                            WHERE a.id_asiento = $1
                        `;
                        const asientoResult = await db.query(asientoQuery, [asiento.id_asiento]);
                        const asientoInfo = asientoResult.rows[0];
                        
                        return {
                            ...asiento,
                            fila: asientoInfo?.fila || null,
                            columna: asientoInfo?.columna || null,
                            numero_asiento: asiento.numero_asiento || `${asientoInfo?.fila || ''}${asientoInfo?.columna || ''}`
                        };
                    } catch (error) {
                        console.warn(`Error obteniendo detalles del asiento ${asiento.id_asiento}:`, error.message);
                        return {
                            ...asiento,
                            fila: null,
                            columna: null,
                            numero_asiento: asiento.numero_asiento || 'N/A'
                        };
                    }
                })
            );

            const detallesFactura = asientosDetallados.map(asiento => ({
                descripcion: `Asiento ${asiento.numero_asiento}`,
                cantidad: 1,
                precio_unitario: asiento.precio_asiento,
                subtotal: asiento.precio_asiento,
                asiento_fila: asiento.fila,
                asiento_numero: asiento.columna
            }));

            console.log('Creando detalles de factura...');
            const facturaDetalles = await FacturaDetalleModel.createMultiple(factura.id_factura, detallesFactura);
            console.log('Detalles de factura creados:', facturaDetalles);

            // 7. Actualizar estado de la venta a confirmada
            console.log('Actualizando estado de venta a confirmada...');

            await VentaModel.updateEstado(venta.id_venta, 'confirmada');

            // === ENVIAR CORREO DE CONFIRMACIÓN ===
            try {
                // Obtener datos del usuario de Firebase
                let datosUsuario = {
                    nombre: 'Cliente',
                    email: 'N/A'
                };
                try {
                    const admin = await import('../config/firebase.js').then(m => m.default);
                    const usuarioFirebase = await admin.auth().getUser(firebase_uid);
                    datosUsuario = {
                        nombre: usuarioFirebase.displayName || usuarioFirebase.email?.split('@')[0] || 'Cliente',
                        email: usuarioFirebase.email || 'N/A'
                    };
                } catch (error) {
                    console.warn('Error obteniendo datos de Firebase, usando valores por defecto:', error.message);
                }

                if (datosUsuario.email && datosUsuario.email !== 'N/A') {
                    const { enviarCorreoConfirmacionCompra } = await import('./contacto.service.js');
                    await enviarCorreoConfirmacionCompra({
                        emailCliente: datosUsuario.email,
                        nombreCliente: datosUsuario.nombre,
                        pelicula: factura.pelicula_titulo || 'N/A',
                        sala: factura.sala_nombre || 'N/A',
                        fechaFuncion: factura.fecha_funcion || new Date(),
                        horarioInicio: factura.hora_inicio || 'N/A',
                        horarioFin: factura.hora_fin || 'N/A',
                        asientos: asientos.map(a => ({ numero_asiento: a.numero_asiento, precio_unitario: a.precio_asiento })),
                        total: factura.total || 0,
                        numeroFactura: factura.numero_factura || factura.venta_id
                    });
                }
            } catch (emailError) {
                console.warn('Error enviando correo de confirmación:', emailError.message);
                // No lanzar error, continuar con la venta
            }

            await client.query('COMMIT');
            console.log('Transacción completada exitosamente');

            const resultado = {
                venta: {
                    id: venta.id_venta,
                    firebase_uid: venta.firebase_uid,
                    funcion_id: venta.id_funcion,
                    total_asientos: venta.cantidad_boletos,
                    subtotal: venta.subtotal,
                    iva: venta.iva,
                    total: venta.total,
                    estado: 'confirmada',
                    fecha_creacion: venta.created_at
                },
                asientos: ventaAsientos,
                pago: {
                    id: pago.id_pago,
                    venta_id: pago.id_venta,
                    metodo_pago_id: pago.id_metodo_pago,
                    monto: pago.monto,
                    estado: 'completado',
                    fecha_pago: pago.fecha_pago
                },
                factura,
                factura_detalles: facturaDetalles
            };

            console.log('Resultado final:', resultado);
            return resultado;

        } catch (error) {
            console.error('=== ERROR EN SERVICIO ===');
            console.error('Tipo de error:', error.constructor.name);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            await client.query('ROLLBACK');
            console.log('Transacción revertida');
            throw error;
        } finally {
            client.release();
            console.log('Conexión liberada');
        }
    }

    async obtenerHistorialVentas(firebase_uid, limit = 10, offset = 0) {
        return await VentaModel.getHistorialByUser(firebase_uid, limit, offset);
    }

    async obtenerVentaPorId(ventaId, firebase_uid) {
        const venta = await VentaModel.findByIdAndUser(ventaId, firebase_uid);
        if (!venta) {
            throw new Error('Venta no encontrada');
        }

        const asientos = await VentaAsientoModel.findByVentaId(ventaId);
        const pagos = await PagoModel.findByVentaId(ventaId);
        const factura = await FacturaModel.findByVentaId(ventaId);
        let facturaDetalles = [];

        if (factura) {
            facturaDetalles = await FacturaDetalleModel.findByFacturaId(factura.id);
        }

        return {
            venta,
            asientos,
            pago: pagos[0],
            factura,
            factura_detalles: facturaDetalles
        };
    }

    async cancelarVenta(ventaId, firebase_uid) {
        const venta = await VentaModel.findByIdAndUser(ventaId, firebase_uid);
        if (!venta) {
            throw new Error('Venta no encontrada');
        }

        if (venta.estado !== 'confirmada') {
            throw new Error('Solo se pueden cancelar ventas confirmadas');
        }

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // Actualizar estado de venta
            await VentaModel.updateEstado(ventaId, 'cancelada');

            // Actualizar estado de factura si existe
            const factura = await FacturaModel.findByVentaId(ventaId);
            if (factura) {
                await FacturaModel.updateEstado(factura.id, 'anulada');
            }

            await client.query('COMMIT');

            return { message: 'Venta cancelada exitosamente' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async obtenerEstadisticas(firebase_uid, fecha_inicio, fecha_fin) {
        return await VentaModel.getEstadisticasByUser(firebase_uid, fecha_inicio, fecha_fin);
    }

    async verificarDisponibilidadAsientos(funcion_id, asientos) {
        try {
            console.log('🔍 Verificando disponibilidad:', { funcion_id, asientos });

            // Convertir asientos a array de IDs si es necesario
            let asientos_ids;
            if (Array.isArray(asientos)) {
                // Si es array de strings/números, usar directamente
                if (typeof asientos[0] === 'string' || typeof asientos[0] === 'number') {
                    asientos_ids = asientos.map(id => parseInt(id));
                } else {
                    // Si es array de objetos, extraer id_asiento
                    asientos_ids = asientos.map(asiento => asiento.id_asiento);
                }
            } else {
                throw new Error('asientos debe ser un array');
            }

            console.log('🎯 IDs de asientos procesados:', asientos_ids);

            // 🔧 SIMPLIFICADO: Solo verificar si están ocupados
            const asientosOcupados = await VentaAsientoModel.checkAsientosOcupadosEnFuncion(
                funcion_id,
                asientos_ids
            );

            console.log('🚫 Asientos ocupados encontrados:', asientosOcupados);

            // Si no hay asientos ocupados, todos están disponibles
            const disponibles = asientosOcupados.length === 0;

            return {
                disponibles: disponibles,
                asientos_ocupados: asientosOcupados.map(row => row.id_asiento),
                funcion_id: funcion_id,
                total_verificados: asientos_ids.length,
                debug: {
                    input_asientos: asientos,
                    processed_ids: asientos_ids,
                    ocupados_count: asientosOcupados.length
                }
            };
        } catch (error) {
            console.error('Error en verificarDisponibilidadAsientos:', error);
            // En caso de error, asumimos que los asientos NO están disponibles por seguridad
            return {
                disponibles: false,
                asientos_ocupados: [],
                error: error.message
            };
        }
    }

    async calcularResumenVenta(ventaData) {
        const { asientos } = ventaData;
        const subtotal = asientos.reduce((sum, asiento) => sum + asiento.precio_asiento, 0);
        const iva = subtotal * 0.12; // Corregido: 12% en lugar de 19%
        const total = subtotal + iva;

        return {
            subtotal,
            iva,
            total,
            total_asientos: asientos.length,
            detalle_asientos: asientos
        };
    }

    async obtenerQRVenta(ventaId, firebase_uid) {
        const venta = await VentaModel.findByIdAndUser(ventaId, firebase_uid);
        if (!venta) {
            throw new Error('Venta no encontrada');
        }

        // Generar datos del QR (en una implementación real, esto incluiría más información)
        const qrData = JSON.stringify({
            venta_id: ventaId,
            firebase_uid,
            fecha: new Date().toISOString()
        });

        // En una implementación real, aquí generarías la imagen QR
        const qrUrl = `data:text/plain;base64,${Buffer.from(qrData).toString('base64')}`;

        return { qr_url: qrUrl, qr_data: qrData };
    }

    async reenviarFactura(ventaId, firebase_uid, email) {
        const venta = await VentaModel.findByIdAndUser(ventaId, firebase_uid);
        if (!venta) {
            throw new Error('Venta no encontrada');
        }

        const factura = await FacturaModel.findByVentaId(ventaId);
        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        // Aquí implementarías el envío por email
        // Por ahora solo retornamos un mensaje de éxito
        return { message: `Factura ${factura.numero_factura} reenviada a ${email}` };
    }

    async validarCupon(codigo_cupon, firebase_uid, total_venta) {
        try {
            // Buscar el cupón en la base de datos
            const cupon = await db.query(
                `SELECT * FROM promociones 
                 WHERE codigo_cupon = $1 
                 AND tipo_promocion = 'Cupon'
                 AND estado = 'Activo'
                 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin`,
                [codigo_cupon]
            );

            if (cupon.rows.length === 0) {
                return {
                    valido: false,
                    mensaje: 'Cupón inválido, expirado o no encontrado'
                };
            }

            const promocion = cupon.rows[0];

            // Calcular descuento
            const descuentoMonto = (total_venta * promocion.porcentaje_descuento) / 100;
            const totalConDescuento = total_venta - descuentoMonto;

            return {
                valido: true,
                promocion,
                descuento_porcentaje: promocion.porcentaje_descuento,
                descuento_monto: descuentoMonto,
                total_final: totalConDescuento, // Renombrado de total_con_descuento
                mensaje: `Descuento del ${promocion.porcentaje_descuento}% aplicado`
            };

        } catch (error) {
            console.error('Error validando cupón:', error);
            return {
                valido: false,
                mensaje: 'Error al validar el cupón'
            };
        }
    }

    async aplicarPromocionesAutomaticas(firebase_uid, total_venta, dia_compra = null) {
        try {
            const diaActual = dia_compra || new Date().toLocaleDateString('es-ES', { weekday: 'long' });
            const diasSemana = {
                'lunes': 'Lunes',
                'martes': 'Martes',
                'miércoles': 'Miercoles',
                'jueves': 'Jueves',
                'viernes': 'Viernes',
                'sábado': 'Sabado',
                'domingo': 'Domingo'
            };
            const diaFormateado = diasSemana[diaActual.toLowerCase()] || diaActual;

            // Buscar promociones automáticas aplicables
            const promociones = await db.query(
                `SELECT * FROM promociones 
                 WHERE tipo_promocion IN ('Descuento', 'Multiplicador')
                 AND estado = 'Activo'
                 AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
                 AND (dia_valido = $1 OR dia_valido = 'Todos')
                 ORDER BY porcentaje_descuento DESC, nro_boletos DESC`,
                [diaFormateado]
            );

            if (promociones.rows.length === 0) {
                return {
                    success: true,
                    promociones_aplicables: [],
                    mejor_promocion: null,
                    descuento: 0,
                    total_final: total_venta // Renombrado de total_con_descuento
                };
            }

            const mejorPromocion = promociones.rows[0];
            let descuento = 0;

            if (mejorPromocion.tipo_promocion === 'Descuento') {
                descuento = (total_venta * mejorPromocion.porcentaje_descuento) / 100;
            }

            return {
                success: true,
                promociones_aplicables: promociones.rows,
                mejor_promocion: mejorPromocion,
                descuento,
                total_original: total_venta,
                total_final: total_venta - descuento // Renombrado de total_con_descuento
            };

        } catch (error) {
            console.error('Error aplicando promociones automáticas:', error);
            throw new Error('Error al aplicar promociones automáticas');
        }
    }

    async obtenerAsientosDisponiblesPorFuncion(id_sala, id_funcion) {
        try {
            return await VentaAsientoModel.getAsientosDisponiblesPorFuncion(id_sala, id_funcion);
        } catch (error) {
            console.error('Error al obtener asientos disponibles por función:', error);
            throw error;
        }
    }

    // Nuevo método: Registrar promoción aplicada en historial
    async registrarPromocionAplicada(ventaId, promocionId, codigoCupon, descuentoAplicado) {
        try {
            const query = `
                INSERT INTO venta_promociones (id_venta, id_promocion, codigo_cupon, descuento_aplicado)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id_venta, id_promocion) DO NOTHING
                RETURNING *
            `;
            
            const result = await db.query(query, [ventaId, promocionId, codigoCupon, descuentoAplicado]);
            return result.rows[0];
        } catch (error) {
            console.error('Error registrando promoción aplicada:', error);
            throw error;
        }
    }

    async obtenerOcupacionPorFuncion(id_funcion) {
        try {
            return await VentaAsientoModel.getOcupacionPorFuncion(id_funcion);
        } catch (error) {
            console.error('Error al obtener ocupación por función:', error);
            throw error;
        }
    }

    async verificarEstructuraBD() {
        try {
            return await VentaAsientoModel.verificarEstructuraBD();
        } catch (error) {
            console.error('Error al verificar estructura BD:', error);
            throw error;
        }
    }
}
export const getVentasByMonthAndYear = async (month, year) => {
    return await VentaModel.getVentasByMonthAndYear(month, year);
};

export const getAllBoletosVendidos = async (month, year) => {
    return await VentaModel.getAllBoletosVendidos(month, year);
};

export const ObtenerVentasporDia = async (startDate, endDate) => {
    return await getVentasPorDia(startDate, endDate);
};

export default new VentaService();
