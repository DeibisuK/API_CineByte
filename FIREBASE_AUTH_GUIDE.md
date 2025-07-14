# Administración de Tokens y Usuarios con Firebase

## Estructura Consolidada

### ✅ **Archivos Existentes Mejorados:**
- `user.controller.js` - Controlador principal de usuarios con funciones de autenticación
- `user.service.js` - Servicios para administración de usuarios y tokens  
- `users.routes.js` - Rutas para la API de usuarios (incluye autenticación)
- `auth.middleware.js` - Middlewares de autenticación mejorados

### 🔧 **Custom Claims Implementados**
Los custom claims ahora incluyen:
```javascript
{
  role: 'admin' | 'employee' | 'user',
  isAdmin: boolean,
  isEmployee: boolean
}
```

## Endpoints Disponibles (Ruta: `/api/users`)

### Administración de Roles (Solo Administradores)

#### Crear Usuario Admin
```http
POST /api/users/crear-admin
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "displayName": "Admin User"
}
```

#### Asignar Rol Admin
```http
POST /api/users/add-admin
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "uid": "user-uid-here"
}
```

#### Remover Rol Admin
```http
POST /api/users/delete-admin
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "uid": "user-uid-here"
}
```

#### Asignar Rol Empleado
```http
POST /api/users/add-employee
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "uid": "user-uid-here"
}
```

#### Remover Rol Empleado
```http
POST /api/users/delete-employee
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "uid": "user-uid-here"
}
```

#### Listar Usuarios
```http
GET /api/users?search=email@example.com
Authorization: Bearer {admin-token}
```

#### Eliminar Usuario
```http
DELETE /api/users/{uid}
Authorization: Bearer {admin-token}
```

#### Editar Usuario
```http
PUT /api/users/{uid}
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "username": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "password": "nuevaPassword"
}
```

#### Revocar Tokens de Usuario
```http
POST /api/users/{uid}/revoke-tokens
Authorization: Bearer {admin-token}
```

#### Cambiar Estado del Usuario
```http
PATCH /api/users/{uid}/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "disabled": true
}
```

#### Generar Custom Token
```http
POST /api/users/{uid}/custom-token
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "additionalClaims": {
    "specialPermission": true
  }
}
```

### Información de Usuario (Autenticados)

#### Obtener Info del Usuario Actual
```http
GET /api/users/me
Authorization: Bearer {user-token}
```

#### Obtener Info de Usuario Específico
```http
GET /api/users/{uid}
Authorization: Bearer {user-token}
```

## Frontend Angular - Implementación Actualizada

### 📁 **Estructura de Servicios**

#### 1. **AuthService** (`src/app/core/services/auth/auth.service.ts`)
- ✅ **Actualizado** para trabajar con nuevos custom claims
- ✅ **Nuevos métodos** para gestión avanzada de usuarios
- ✅ **Compatibilidad** con roles `admin`, `employee`, `user`

#### 2. **UserManagementService** (`src/app/core/services/user-management.service.ts`)
- ✅ **Nuevo servicio** dedicado para gestión de usuarios
- ✅ **Métodos centralizados** para todas las operaciones
- ✅ **Manejo de errores** y autenticación automática

#### 3. **PermissionService** (`src/app/core/services/permission/permission.service.ts`)
- ✅ **Actualizado** para roles nuevos
- ✅ **Compatibilidad** con formato anterior

### 🎨 **Componentes Mejorados**

#### **ListUsersComponent** - Panel de Administración de Usuarios
```typescript
// Funcionalidades implementadas:
- ✅ Búsqueda avanzada de usuarios
- ✅ Filtros por rol (Admin, Empleado, Usuario)
- ✅ Asignación/remoción de roles
- ✅ Ver detalles completos del usuario
- ✅ Revocar tokens (forzar re-login)
- ✅ Habilitar/deshabilitar usuarios
- ✅ Edición de información del usuario
- ✅ Estados visuales (activo/deshabilitado)
- ✅ Estadísticas en tiempo real
```

### 🔧 **Nuevas Funcionalidades Frontend**

#### **1. Gestión de Estados de Usuario**
```html
<!-- Indicador de estado del usuario -->
<div class="user-status">
    <span [class]="'status-badge ' + obtenerClaseEstado(user)">
        {{obtenerEstadoUsuario(user)}}
    </span>
    <span *ngIf="!user.emailVerified" class="email-not-verified">
        ⚠️ Email no verificado
    </span>
</div>
```

#### **2. Menús Dropdown para Acciones**
```html
<!-- Dropdown de gestión de roles -->
<div class="dropdown">
    <button class="btn-action dropdown-toggle">Roles</button>
    <div class="dropdown-content">
        <button (click)="asignarAdminUsuario(user.uid)">🛡️ Hacer Admin</button>
        <button (click)="asignarEmpleadoUsuario(user.uid)">👨‍💼 Hacer Empleado</button>
        <button (click)="quitarAdminUsuario(user.uid)">❌ Quitar Admin</button>
    </div>
</div>
```

#### **3. Detalles Completos del Usuario**
```typescript
verDetallesUsuario(uid: string) {
    this.userManagementService.obtenerUsuario(uid).subscribe({
        next: (usuario) => {
            // Mostrar información completa en modal
            // Incluye: claims, fechas, estado, provider, etc.
        }
    });
}
```

### 📊 **Dashboard de Estadísticas**
```typescript
// Estadísticas automáticas
stats$ = this.userManagementService.obtenerEstadisticas();

// Template
<div class="stats">
    <div class="stat-card">
        <div class="stat-number">{{(stats$ | async)?.total}}</div>
        <div class="stat-label">Total Usuarios</div>
    </div>
    <div class="stat-card">
        <div class="stat-number">{{(stats$ | async)?.administradores}}</div>
        <div class="stat-label">Administradores</div>
    </div>
    <!-- más estadísticas... -->
</div>
```

### 🔐 **Gestión de Permisos Mejorada**

#### **Verificación de Roles en Componentes**
```typescript
export class AdminComponent {
    canViewUsers$ = this.permissionService.canViewUsers();
    canEditUsers$ = this.permissionService.canEditUsers();
    canDeleteUsers$ = this.permissionService.canDeleteUsers();
    
    constructor(
        private permissionService: PermissionService,
        private userManagementService: UserManagementService
    ) {}
    
    async ngOnInit() {
        // Verificar rol actual
        const isAdmin = await this.userManagementService.tieneRol('admin');
        const claims = await this.userManagementService.obtenerClaimsActuales();
    }
}
```

#### **Guards para Rutas**
```typescript
// Ejemplo de guard para rutas de admin
@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {}
    
    async canActivate(): Promise<boolean> {
        try {
            const claims = await this.authService.obtenerClaimsActuales();
            if (claims?.isAdmin) {
                return true;
            }
            this.router.navigate(['/dashboard']);
            return false;
        } catch {
            this.router.navigate(['/login']);
            return false;
        }
    }
}
```

### 🎯 **Uso en Componentes**

#### **Ejemplo: Gestión Completa de Usuario**
```typescript
export class UserCardComponent {
    @Input() user!: UserProfile;
    
    constructor(
        private userManagementService: UserManagementService,
        private alertService: AlertaService
    ) {}
    
    // Cambiar rol del usuario
    async cambiarRol(uid: string, nuevoRol: 'admin' | 'employee' | 'user') {
        try {
            switch(nuevoRol) {
                case 'admin':
                    await this.userManagementService.asignarRolAdmin(uid).toPromise();
                    break;
                case 'employee':
                    await this.userManagementService.asignarRolEmpleado(uid).toPromise();
                    break;
                case 'user':
                    // Remover roles existentes
                    break;
            }
            this.alertService.success('Éxito', 'Rol actualizado correctamente');
        } catch (error) {
            this.alertService.error('Error', 'No se pudo cambiar el rol');
        }
    }
    
    // Revocar tokens
    revocarTokens(uid: string) {
        this.userManagementService.revocarTokens(uid).subscribe({
            next: () => this.alertService.success('Tokens revocados', 'El usuario debe volver a iniciar sesión'),
            error: (err) => this.alertService.error('Error', err.message)
        });
    }
}
```

### 🚀 **Próximas Mejoras Sugeridas**

1. **Notificaciones en Tiempo Real**
   - Usar WebSockets para notificar cambios de roles
   - Alertas cuando se revoquen tokens

2. **Logs de Actividad**
   - Historial de cambios de roles
   - Registro de acciones administrativas

3. **Importación/Exportación**
   - Exportar lista de usuarios
   - Importación masiva de usuarios

4. **Filtros Avanzados**
   - Por fecha de registro
   - Por último acceso
   - Por provider de autenticación

## Seguridad

### 1. **Custom Claims son seguros**
- Se establecen solo desde el servidor usando Firebase Admin SDK
- No pueden ser modificados desde el frontend
- Se incluyen automáticamente en los ID tokens

### 2. **Tokens tienen expiración**
- Los ID tokens expiran en 1 hora
- Los custom claims se actualizan automáticamente al renovar el token
- Puedes forzar renovación con `getIdToken(true)`

### 3. **Revocación de tokens**
- Puedes revocar todos los tokens de un usuario
- Útil para casos de compromiso de seguridad
- El usuario debe autenticarse nuevamente

## Comandos de Utilidad

### Verificar configuración de Firebase
```bash
# Verificar que Firebase Admin esté configurado
node -e "import('./src/config/firebase.js')"
```

### Crear primer admin (script de utilidad)
```javascript
// create-admin.js
import admin from 'firebase-admin';
import './src/config/firebase.js';

const createFirstAdmin = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
      isAdmin: true
    });
    console.log(`Usuario ${email} es ahora administrador`);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usar: node create-admin.js
createFirstAdmin('admin@cinebyte.com');
```

¡Con esta implementación tienes control completo sobre la administración de tokens y usuarios usando Firebase!
