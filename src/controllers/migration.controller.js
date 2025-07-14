import admin from '../config/firebase.js';

/**
 * Endpoint temporal para migrar usuarios del sistema anterior al nuevo
 * Este endpoint se debe ejecutar UNA SOLA VEZ y luego eliminarse
 */
export const migrarUsuarios = async (req, res) => {
  try {
    console.log('🔄 Iniciando migración de usuarios...');
    
    const resultados = {
      adminsMigrados: [],
      empleadosMigrados: [],
      usuariosRevisados: 0,
      errores: []
    };

    // Obtener todos los usuarios de Firebase Auth
    const listaUsuarios = await admin.auth().listUsers();
    resultados.usuariosRevisados = listaUsuarios.users.length;

    console.log(`📊 Revisando ${listaUsuarios.users.length} usuarios...`);

    for (const usuario of listaUsuarios.users) {
      try {
        const uid = usuario.uid;
        const email = usuario.email || 'Sin email';
        
        // Obtener claims actuales
        const claimsActuales = usuario.customClaims || {};
        
        console.log(`🔍 Revisando usuario: ${email} (${uid})`);
        console.log(`   Claims actuales:`, claimsActuales);

        // Variable para nuevas claims
        let nuevasClaims = null;

        // MIGRACIÓN: role: 'admin' → isAdmin: true, role: 'admin'
        if (claimsActuales.role === 'admin') {
          nuevasClaims = {
            ...claimsActuales,
            isAdmin: true,
            role: 'admin'
          };
          
          console.log(`✅ Admin detectado: ${email}`);
          resultados.adminsMigrados.push({
            uid,
            email,
            claimsAnteriores: claimsActuales,
            claimsNuevas: nuevasClaims
          });
        }
        
        // MIGRACIÓN: role: 'empleado' → isEmployee: true, role: 'employee'
        else if (claimsActuales.role === 'empleado') {
          nuevasClaims = {
            ...claimsActuales,
            isEmployee: true,
            role: 'employee'
          };
          
          console.log(`✅ Empleado detectado: ${email}`);
          resultados.empleadosMigrados.push({
            uid,
            email,
            claimsAnteriores: claimsActuales,
            claimsNuevas: nuevasClaims
          });
        }

        // Aplicar nuevas claims si hay cambios
        if (nuevasClaims) {
          await admin.auth().setCustomUserClaims(uid, nuevasClaims);
          console.log(`🔄 Claims actualizadas para: ${email}`);
        } else {
          console.log(`⏭️  Sin cambios necesarios para: ${email}`);
        }

      } catch (error) {
        console.error(`❌ Error procesando usuario ${usuario.uid}:`, error);
        resultados.errores.push({
          uid: usuario.uid,
          email: usuario.email,
          error: error.message
        });
      }
    }

    console.log('✅ Migración completada!');
    
    const resumen = {
      mensaje: 'Migración de usuarios completada exitosamente',
      estadisticas: {
        usuariosRevisados: resultados.usuariosRevisados,
        adminsMigrados: resultados.adminsMigrados.length,
        empleadosMigrados: resultados.empleadosMigrados.length,
        errores: resultados.errores.length
      },
      detalles: resultados
    };

    console.log('📊 Resumen de migración:', resumen.estadisticas);

    res.status(200).json(resumen);

  } catch (error) {
    console.error('❌ Error en migración:', error);
    res.status(500).json({
      error: 'Error durante la migración',
      mensaje: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Endpoint para verificar el estado de la migración sin hacer cambios
 */
export const verificarEstadoMigracion = async (req, res) => {
  try {
    console.log('🔍 Verificando estado de migración...');
    
    const estadisticas = {
      adminsAntiguos: 0,        // role: 'admin'
      adminsNuevos: 0,          // isAdmin: true
      empleadosAntiguos: 0,     // role: 'empleado'
      empleadosNuevos: 0,       // isEmployee: true
      usuariosRegulares: 0,     // sin roles especiales
      total: 0
    };

    const detalles = {
      adminsAntiguos: [],
      adminsNuevos: [],
      empleadosAntiguos: [],
      empleadosNuevos: [],
      usuariosRegulares: []
    };

    // Obtener todos los usuarios
    const listaUsuarios = await admin.auth().listUsers();
    estadisticas.total = listaUsuarios.users.length;

    for (const usuario of listaUsuarios.users) {
      const claims = usuario.customClaims || {};
      const email = usuario.email || 'Sin email';
      const info = { uid: usuario.uid, email, claims };

      // Clasificar usuarios por tipo de claims
      if (claims.isAdmin === true) {
        estadisticas.adminsNuevos++;
        detalles.adminsNuevos.push(info);
      } else if (claims.role === 'admin') {
        estadisticas.adminsAntiguos++;
        detalles.adminsAntiguos.push(info);
      } else if (claims.isEmployee === true) {
        estadisticas.empleadosNuevos++;
        detalles.empleadosNuevos.push(info);
      } else if (claims.role === 'empleado') {
        estadisticas.empleadosAntiguos++;
        detalles.empleadosAntiguos.push(info);
      } else {
        estadisticas.usuariosRegulares++;
        detalles.usuariosRegulares.push(info);
      }
    }

    const necesitaMigracion = estadisticas.adminsAntiguos > 0 || estadisticas.empleadosAntiguos > 0;

    res.status(200).json({
      necesitaMigracion,
      estadisticas,
      detalles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    res.status(500).json({
      error: 'Error verificando estado de migración',
      mensaje: error.message
    });
  }
};
