import ventaService from '../services/venta.service.js';
import { getVentasByMonthAndYear,
    getAllBoletosVendidos,
    ObtenerVentasporDia } from '../services/venta.service.js';

class VentaController {
    
    async procesarVenta(req, res) {
        try {
            const compraData = req.body;
            console.log('=== PROCESANDO VENTA ===');
            console.log('Datos recibidos:', JSON.stringify(compraData, null, 2));
            
            // Validar datos requeridos
            if (!compraData.firebase_uid || !compraData.funcion_id || !compraData.asientos || !compraData.metodo_pago_id) {
                console.log('Validación fallida - datos faltantes');
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos: firebase_uid, funcion_id, asientos, metodo_pago_id'
                });
            }

            if (!Array.isArray(compraData.asientos) || compraData.asientos.length === 0) {
                console.log('Validación fallida - asientos inválidos');
                return res.status(400).json({
                    success: false,
                    message: 'Debe seleccionar al menos un asiento'
                });
            }

            console.log('Iniciando procesamiento en el servicio...');
            const resultado = await ventaService.procesarCompraCompleta(compraData);
            console.log('Venta procesada exitosamente:', resultado);
            
            res.status(201).json(resultado);
            
        } catch (error) {
            console.error('=== ERROR EN PROCESARVENTA ===');
            console.error('Tipo de error:', error.constructor.name);
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async obtenerHistorial(req, res) {
        try {
            const { firebase_uid, limit = 10, offset = 0 } = req.query;

            if (!firebase_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid es requerido'
                });
            }

            const historial = await ventaService.obtenerHistorialVentas(firebase_uid, parseInt(limit), parseInt(offset));
            
            res.json(historial);
            
        } catch (error) {
            console.error('Error en obtenerHistorial:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async obtenerVentaPorId(req, res) {
        try {
            const { id } = req.params;
            const { firebase_uid } = req.query;

            if (!firebase_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid es requerido'
                });
            }

            const venta = await ventaService.obtenerVentaPorId(parseInt(id), firebase_uid);
            
            res.json(venta);
            
        } catch (error) {
            console.error('Error en obtenerVentaPorId:', error);
            const status = error.message === 'Venta no encontrada' ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async cancelarVenta(req, res) {
        try {
            const { id } = req.params;
            const { firebase_uid } = req.body;

            if (!firebase_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid es requerido'
                });
            }

            const resultado = await ventaService.cancelarVenta(parseInt(id), firebase_uid);
            
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en cancelarVenta:', error);
            const status = error.message === 'Venta no encontrada' ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const { firebase_uid, fecha_inicio, fecha_fin } = req.query;

            if (!firebase_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid es requerido'
                });
            }

            const estadisticas = await ventaService.obtenerEstadisticas(firebase_uid, fecha_inicio, fecha_fin);
            
            res.json(estadisticas);
            
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async verificarAsientos(req, res) {
        try {
            const { funcion_id, asientos } = req.body;

            if (!funcion_id || !asientos || !Array.isArray(asientos)) {
                return res.status(400).json({
                    success: false,
                    message: 'funcion_id y asientos (array) son requeridos'
                });
            }

            const resultado = await ventaService.verificarDisponibilidadAsientos(funcion_id, asientos);
            
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en verificarAsientos:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async calcularResumen(req, res) {
        try {
            const ventaData = req.body;

            if (!ventaData.asientos || !Array.isArray(ventaData.asientos)) {
                return res.status(400).json({
                    success: false,
                    message: 'asientos (array) es requerido'
                });
            }

            const resumen = await ventaService.calcularResumenVenta(ventaData);
            
            res.json(resumen);
            
        } catch (error) {
            console.error('Error en calcularResumen:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async obtenerQR(req, res) {
        try {
            const { id } = req.params;
            const { firebase_uid } = req.query;

            if (!firebase_uid) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid es requerido'
                });
            }

            const qr = await ventaService.obtenerQRVenta(parseInt(id), firebase_uid);
            
            res.json(qr);
            
        } catch (error) {
            console.error('Error en obtenerQR:', error);
            const status = error.message === 'Venta no encontrada' ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async reenviarFactura(req, res) {
        try {
            const { id } = req.params;
            const { firebase_uid, email } = req.body;

            if (!firebase_uid || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid y email son requeridos'
                });
            }

            const resultado = await ventaService.reenviarFactura(parseInt(id), firebase_uid, email);
            
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en reenviarFactura:', error);
            const status = error.message.includes('no encontrada') ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async validarCupon(req, res) {
        try {
            const { codigo_cupon, firebase_uid, total_venta } = req.body;

            if (!codigo_cupon || !firebase_uid || !total_venta) {
                return res.status(400).json({
                    success: false,
                    message: 'codigo_cupon, firebase_uid y total_venta son requeridos'
                });
            }

            const resultado = await ventaService.validarCupon(codigo_cupon, firebase_uid, total_venta);
            
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en validarCupon:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async aplicarPromocionesAutomaticas(req, res) {
        try {
            const { firebase_uid, total_venta, dia_compra } = req.body;

            if (!firebase_uid || !total_venta) {
                return res.status(400).json({
                    success: false,
                    message: 'firebase_uid y total_venta son requeridos'
                });
            }

            const resultado = await ventaService.aplicarPromocionesAutomaticas(firebase_uid, total_venta, dia_compra);
            
            res.json(resultado);
            
        } catch (error) {
            console.error('Error en aplicarPromocionesAutomaticas:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    // Obtener asientos disponibles para una función específica
    async obtenerAsientosDisponiblesPorFuncion(req, res) {
        try {
            const { id_sala, id_funcion } = req.params;
            
            if (!id_sala || !id_funcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren id_sala e id_funcion'
                });
            }
            
            const asientos = await ventaService.obtenerAsientosDisponiblesPorFuncion(id_sala, id_funcion);
            
            res.json({
                success: true,
                data: asientos
            });
        } catch (error) {
            console.error('Error al obtener asientos disponibles por función:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de ocupación de una función
    async obtenerOcupacionPorFuncion(req, res) {
        try {
            const { id_funcion } = req.params;
            
            if (!id_funcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere id_funcion'
                });
            }
            
            const ocupacion = await ventaService.obtenerOcupacionPorFuncion(id_funcion);
            
            res.json({
                success: true,
                data: ocupacion
            });
        } catch (error) {
            console.error('Error al obtener ocupación por función:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // 🔧 TEMPORAL: Verificar estructura de base de datos
    async verificarEstructuraBD(req, res) {
        try {
            const resultado = await ventaService.verificarEstructuraBD();
            
            res.json({
                success: true,
                data: resultado
            });
        } catch (error) {
            console.error('Error al verificar estructura BD:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export const getVentasPorMesYAnio = async (req, res) => {
    try {
        const { month, year } = req.params;
        const ventas = await getVentasByMonthAndYear(month, year);
        res.json({ventas});
    } catch (error) {
        console.error('Error al obtener ventas por mes y año:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const getTodosBoletosVendidos = async (req, res) => {
    try {
        const { month, year } = req.params;
        const boletosVendidos = await getAllBoletosVendidos(month, year);
        res.json({boletosVendidos
        });
    } catch (error) {
        console.error('Error al obtener todos los boletos vendidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export const getVentasPorDia = async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const ventasPorDia = await ObtenerVentasporDia(startDate, endDate);
        res.json(ventasPorDia);
    } catch (error) {
        console.error('Error al obtener ventas por día:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};


export default new VentaController();
