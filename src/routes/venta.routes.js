import express from 'express';
import ventaController from '../controllers/venta.controller.js';

const router = express.Router();

// Procesar una venta completa
router.post('/', ventaController.procesarVenta);

// Obtener historial de ventas
router.get('/historial', ventaController.obtenerHistorial);

// Obtener venta por ID
router.get('/:id', ventaController.obtenerVentaPorId);

// Cancelar venta
router.patch('/:id/cancelar', ventaController.cancelarVenta);

// Obtener estadísticas
router.get('/estadisticas', ventaController.obtenerEstadisticas);

// Verificar disponibilidad de asientos
router.post('/verificar-asientos', ventaController.verificarAsientos);

// Calcular resumen de venta
router.post('/resumen', ventaController.calcularResumen);

// Obtener QR de venta
router.get('/:id/qr', ventaController.obtenerQR);

// Reenviar factura por email
router.post('/:id/reenviar-factura', ventaController.reenviarFactura);

// Validar cupón de descuento
router.post('/validar-cupon', ventaController.validarCupon);

export default router;
