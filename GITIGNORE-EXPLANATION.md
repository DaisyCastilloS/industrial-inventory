# 📋 Explicación del .gitignore

Este documento explica qué archivos están incluidos en `.gitignore` y por qué no deberían estar en el repositorio.

## 🚫 Archivos Ignorados

### 📦 **Dependencias**
```
node_modules/
pnpm-lock.yaml
```
**¿Por qué?** 
- `node_modules/` contiene todas las dependencias instaladas (muy pesado)
- `pnpm-lock.yaml` se regenera automáticamente con `pnpm install`

### 🏗️ **Archivos de Construcción**
```
dist/
build/
*.tsbuildinfo
```
**¿Por qué?**
- Son archivos generados automáticamente por TypeScript
- Se pueden recrear con `pnpm run build`
- No son código fuente

### 🔐 **Archivos de Entorno**
```
.env
.env.local
.env.development
.env.test
.env.production
.env.*.local
```
**¿Por qué?**
- Contienen variables de entorno sensibles (contraseñas, API keys)
- Son específicos de cada entorno de desarrollo
- Pueden contener información de seguridad

### 📝 **Logs**
```
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*
```
**¿Por qué?**
- Son archivos temporales generados durante la ejecución
- Pueden ser muy grandes
- No son relevantes para el código fuente

### 🧪 **Cobertura de Tests**
```
coverage/
.nyc_output/
*.lcov
```
**¿Por qué?**
- Son reportes generados automáticamente por Jest
- Se pueden regenerar con `pnpm run test:coverage`
- No son código fuente

### 🐳 **Docker**
```
postgres_data/
docker-compose.override.yml
```
**¿Por qué?**
- `postgres_data/` contiene datos de la base de datos (muy pesado)
- `docker-compose.override.yml` es para configuraciones locales

### 💻 **Sistema Operativo**
```
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
```
**¿Por qué?**
- Son archivos del sistema operativo (macOS, Windows)
- No son relevantes para el proyecto

### 🔧 **Editores**
```
.vscode/
.idea/
*.swp
*.swo
*~
```
**¿Por qué?**
- Son configuraciones específicas del editor
- Cada desarrollador puede tener configuraciones diferentes

### ⏰ **Temporales**
```
*.tmp
*.temp
.cache/
.temp/
```
**¿Por qué?**
- Archivos temporales generados por herramientas
- No son parte del código fuente

### 🔒 **Seguridad**
```
*.pem
*.key
*.crt
*.p12
*.pfx
```
**¿Por qué?**
- Contienen claves privadas y certificados
- Son información sensible que no debe compartirse

### 🗄️ **Base de Datos**
```
*.sqlite
*.sqlite3
*.db
```
**¿Por qué?**
- Contienen datos de la aplicación
- Pueden ser muy grandes
- Se pueden regenerar con migraciones

### 💾 **Backups**
```
*.bak
*.backup
*.old
```
**¿Por qué?**
- Son copias de seguridad temporales
- No son código fuente

### 🚀 **Deploy**
```
.deploy/
.deployment/
```
**¿Por qué?**
- Contienen archivos específicos del despliegue
- Pueden contener configuraciones sensibles

### 📊 **Monitoreo**
```
*.pid
*.seed
*.pid.lock
```
**¿Por qué?**
- Son archivos de procesos en ejecución
- No son relevantes para el código

### 🧪 **Testing**
```
test-results/
playwright-report/
test-results.xml
```
**¿Por qué?**
- Son reportes generados por herramientas de testing
- Se pueden regenerar

### 📚 **Documentación Generada**
```
docs/build/
docs/.vuepress/dist/
```
**¿Por qué?**
- Son archivos generados automáticamente
- Se pueden recrear con el comando de build

### 🧪 **Scripts de Prueba**
```
test-api.sh
quick-test.sh
TESTING-ENDPOINTS.md
RESUMEN-PRUEBAS.md
```
**¿Por qué?**
- Son herramientas de desarrollo local
- No son parte del código fuente de la aplicación
- Pueden contener tokens o datos de prueba

### 🔧 **Configuraciones Locales**
```
.eslintrc.local.js
.prettierrc.local
jest.config.local.js
.lintstagedrc.local.js
commitlint.config.local.js
```
**¿Por qué?**
- Son configuraciones específicas del desarrollador
- Cada uno puede tener preferencias diferentes

### 📝 **Archivos de TypeScript**
```
src/**/*.js
src/**/*.js.map
dist/**/*.js
dist/**/*.js.map
```
**¿Por qué?**
- Son archivos JavaScript generados por TypeScript
- Se pueden recrear con `pnpm run build`

### 🔧 **Archivos de Configuración de Herramientas**
```
.eslintcache
.eslintrc.js.bak
.prettierrc.bak
jest.config.js.bak
tsconfig.tsbuildinfo
```
**¿Por qué?**
- Son archivos de cache y backup de herramientas
- Se regeneran automáticamente

## ✅ Archivos que SÍ van en Git

### 📋 **Código Fuente**
- `src/` - Todo el código TypeScript
- `scripts/` - Scripts de utilidad
- `docs/` - Documentación (excepto build)

### ⚙️ **Configuración**
- `package.json` - Dependencias del proyecto
- `tsconfig.json` - Configuración de TypeScript
- `jest.config.js` - Configuración de tests
- `eslint.config.js` - Configuración de linting
- `.prettierrc` - Configuración de formateo
- `commitlint.config.js` - Configuración de commits
- `docker-compose.yml` - Configuración de Docker

### 📚 **Documentación**
- `README.md` - Documentación principal
- `docs/` - Documentación del proyecto
- `Makefile` - Comandos de utilidad

### 🔧 **Herramientas de Desarrollo**
- `.husky/` - Git hooks
- `.lintstagedrc.js` - Configuración de lint-staged
- `fix-imports.sh` - Script de utilidad

## 🚨 Archivos Críticos que NO van en Git

### 🔐 **Variables de Entorno**
```bash
# ❌ NUNCA subir estos archivos
.env
.env.local
.env.production
```

### 🔑 **Claves y Certificados**
```bash
# ❌ NUNCA subir estos archivos
*.pem
*.key
*.crt
```

### 🗄️ **Datos de Base de Datos**
```bash
# ❌ NUNCA subir estos archivos
*.sqlite
*.db
postgres_data/
```

## 📝 Notas Importantes

1. **Siempre verifica** qué archivos se van a subir antes de hacer commit
2. **Usa `.env.example`** para mostrar qué variables de entorno necesita el proyecto
3. **Documenta** cualquier configuración local necesaria
4. **Revisa** el `.gitignore` cuando agregues nuevas herramientas

## 🔍 Comandos Útiles

### Ver qué archivos están siendo ignorados
```bash
git status --ignored
```

### Ver qué archivos se van a subir
```bash
git add .
git status
```

### Verificar si un archivo está siendo ignorado
```bash
git check-ignore archivo.txt
``` 