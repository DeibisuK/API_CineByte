import express from 'express';
import ventaController from '../controllers/venta.controller.js';
import {getVentasPorMesYAnio,
    getTodosBoletosVendidos,getVentasPorDia
} from '../controllers/venta.controller.js';

const router = express.Router();

// Procesar una venta completa
router.post('/', ventaController.procesarVenta);

// Obtener historial de ventas
router.get('/historial', ventaController.obtenerHistorial);

// Obtener estadísticas
router.get('/estadisticas', ventaController.obtenerEstadisticas);

// Verificar disponibilidad de asientos
router.post('/verificar-asientos', ventaController.verificarAsientos);

// Calcular resumen de venta
router.post('/resumen', ventaController.calcularResumen);

// Validar cupón de descuento
router.post('/validar-cupon', ventaController.validarCupon);

// Aplicar promociones automáticas
router.post('/promociones-automaticas', ventaController.aplicarPromocionesAutomaticas);

// Obtener asientos disponibles para una función específica
router.get('/asientos-disponibles/:id_sala/:id_funcion', ventaController.obtenerAsientosDisponiblesPorFuncion);

// Obtener ocupación de una función específica
router.get('/ocupacion/:id_funcion', ventaController.obtenerOcupacionPorFuncion);

// Obtener venta por ID
router.get('/:id', ventaController.obtenerVentaPorId);

// Cancelar venta
router.patch('/:id/cancelar', ventaController.cancelarVenta);

// Obtener QR de venta
router.get('/:id/qr', ventaController.obtenerQR);

// Reenviar factura por email
router.post('/:id/reenviar-factura', ventaController.reenviarFactura);

// Obtener ventas por mes y año
router.get('/ventas-por-mes/:month/:year', getVentasPorMesYAnio);

// Obtener todos los boletos vendidos
router.get('/boletos-vendidos/:month/:year', getTodosBoletosVendidos);

// Obtener ventas por día
router.get('/ventas-por-dia/:startDate/:endDate', getVentasPorDia);

export default router;
