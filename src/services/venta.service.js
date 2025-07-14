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
                transaccion_id
            } = compraData;

            // Calcular totales
            const subtotal = asientos.reduce((sum, asiento) => sum + asiento.precio_asiento, 0);
            const iva = subtotal * 0.19;
            const total = subtotal + iva;
            
            console.log('Totales calculados:', { subtotal, iva, total });

            // 1. Crear la venta
            const ventaData = {
                firebase_uid,
                funcion_id,
                total_asientos: asientos.length,
                subtotal,
                iva,
                total,
                estado: 'pendiente'
            };
            
            console.log('Creando venta con datos:', ventaData);
            const venta = await VentaModel.create(ventaData);
            console.log('Venta creada:', venta);

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

            // 5. Crear la factura
            const facturaData = {
                venta_id: venta.id_venta,
                numero_factura: numeroFactura,
                subtotal,
                iva,
                total,
                estado: 'emitida'
            };
            
            console.log('Creando factura con datos:', facturaData);
            const factura = await FacturaModel.create(facturaData);
            console.log('Factura creada:', factura);

            // 6. Crear detalles de la factura
            const detallesFactura = asientos.map(asiento => ({
                descripcion: `Asiento ${asiento.numero_asiento}`,
                cantidad: 1,
                precio_unitario: asiento.precio_asiento,
                subtotal: asiento.precio_asiento
            }));

            console.log('Creando detalles de factura...');
            const facturaDetalles = await FacturaDetalleModel.createMultiple(factura.id_factura, detallesFactura);
            console.log('Detalles de factura creados:', facturaDetalles);

            // 7. Actualizar estado de la venta a confirmada
            console.log('Actualizando estado de venta a confirmada...');
            await VentaModel.updateEstado(venta.id_venta, 'confirmada');

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
        const iva = subtotal * 0.19;
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
        // Implementación básica - en una app real esto consultaría una tabla de cupones
        const cuponesValidos = {
            'DESCUENTO10': { porcentaje: 10, activo: true },
            'DESCUENTO20': { porcentaje: 20, activo: true },
            'BIENVENIDO': { porcentaje: 15, activo: true }
        };

        const cupon = cuponesValidos[codigo_cupon];
        
        if (!cupon || !cupon.activo) {
            return {
                valido: false,
                mensaje: 'Cupón no válido o expirado'
            };
        }

        const descuentoMonto = (total_venta * cupon.porcentaje) / 100;
        const totalConDescuento = total_venta - descuentoMonto;

        return {
            valido: true,
            descuento_porcentaje: cupon.porcentaje,
            descuento_monto: descuentoMonto,
            total_con_descuento: totalConDescuento,
            mensaje: `Descuento del ${cupon.porcentaje}% aplicado`
        };
    }

    async obtenerAsientosDisponiblesPorFuncion(id_sala, id_funcion) {
        try {
            return await VentaAsientoModel.getAsientosDisponiblesPorFuncion(id_sala, id_funcion);
        } catch (error) {
            console.error('Error al obtener asientos disponibles por función:', error);
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
