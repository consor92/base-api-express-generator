# Base API Express Generator 🚀

Esta es una plantilla base (boilerplate) robusta para construir APIs con Node.js y Express. Está configurada con estándares de la industria, incluyendo herramientas para bases de datos (SQL y NoSQL), autenticación, seguridad y calidad de código.

## 🛠️ Tecnologías Incluidas

* **Core:** Node.js, Express
* **Bases de Datos:** Mongoose (MongoDB), Sequelize (SQL)
* **Autenticación & Seguridad:** JWT (JSON Web Tokens), Bcrypt, CORS
* **Desarrollo:** Nodemon, Morgan, Dotenv
* **Calidad de Código:** ESLint, Prettier

---

## 📋 Requisitos Previos

Asegúrate de tener instalado en tu sistema:
* [Node.js](https://nodejs.org/) (v16 o superior)
* npm (viene incluido con Node)

---

## 🚀 Instalación y Configuración desde Cero

Sigue estos pasos para recrear la estructura de este proyecto desde cero.

### 1. Generar la estructura base
Utilizamos el generador oficial de Express configurado para una API pura (sin vistas HTML):
```bash
npx express-generator --no-view nombre-del-proyecto
cd nombre-del-proyecto
```

2. Configurar las dependencias
Reemplaza el contenido del archivo package.json generado automáticamente por el siguiente:
```bash
{
  "name": "base-api-express-generator",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www ",
    "format": "prettier --write '**/*.{js,json,md}'",
    "lint": "eslint . --ext .js",
    "migrate": "migrate-mongo",
    "migrate-dev": "NODE_ENV=development migrate-mongo"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "~1.4.4",
    "cors": "^2.8.5",
    "debug": "~2.6.9",
    "dotenv": "^16.3.1",
    "express": "~4.16.1",
    "figlet": "^1.6.0",
    "jsonwebtoken": "^9.0.2",
    "migrate-mongo": "^11.0.0",
    "mongodb": "^6.1.0",
    "mongoose": "^7.6.0",
    "mongoose-validator": "^2.1.0",
    "sequelize": "^6.28.0", 
    "mysql2": "^3.4.5", 
    "morgan": "~1.9.1"
  },
  "devDependencies": {
    "eslint": "^8.51.0",
    "nodemon": "^3.0.1",
    "prettier": "^3.0.3"
  }
}
```

Luego, instala todas las dependencias ejecutando:
```bash
npm install
```

3. Archivos de Configuración
Crea los siguientes archivos en la raíz de tu proyecto:
.env (Variables de entorno)
```bash
ENV=development
PORT=4000
MONGO_URL=mongodb://127.0.0.1:27017/
MONGO_URL_AUTH_ENABLED=mongodb://user:password@127.0.0.1:27017/
MONGO_DB=base-api-express-generator
DATABASE_URL=mysql://root:@localhost:3306/Probando
```

.prettierrc (Reglas de formateo)
```bash
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}
```
.eslintrc.json (Reglas de Linter)

```bash
{
  "env": {
    "node": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```
.gitignore (Archivos ignorados por Git)
```bash
node_modules/
.env
```

4. Limpieza del proyecto
Elimina la carpeta public/ (ya que es una API, no serviremos archivos estáticos aquí).

En el archivo app.js, elimina la línea que hace referencia a la carpeta public:
```bash
app.use(express.static(path.join(__dirname, 'public')));.
```

💻 Scripts Disponibles
En el directorio del proyecto, puedes ejecutar los siguientes comandos:
```bash
npm run dev: Inicia el servidor en modo desarrollo utilizando Nodemon (se reiniciará automáticamente al guardar cambios).
npm start: Inicia el servidor en modo producción.
npm run format: Aplica las reglas de Prettier a todos los archivos del proyecto para unificar el estilo de código.
npm run lint: Analiza el código buscando errores de sintaxis y malas prácticas utilizando ESLint.
```

## 📁 Estructura del Proyecto

Esta es la organización de los directorios y archivos principales del proyecto:

### 📂 Carpetas (Directorios)
* **`bin/`**: Contiene el archivo de arranque del servidor (por ejemplo, `www`).
* **`config/`**: Configuraciones de la base de datos o servicios externos.
* **`middlewares/`**: Funciones intermedias (por ejemplo, verificación de tokens o roles).
* **`migration/`**: Archivos con el historial de cambios de la base de datos.
* **`model/`**: Definiciones de los esquemas y tablas de la base de datos.
* **`routes/`**: Definición de los endpoints y rutas de la API.
* **`schemas/`**: Validaciones de datos de entrada (payloads de peticiones).
* **`utils/`**: Herramientas y funciones auxiliares reutilizables.

### 📄 Archivos Principales
* **`app.js`**: Configuración principal de la aplicación Express y sus middlewares.
* **`.env`**: Variables de entorno y contraseñas secretas (no se sube al repositorio).
* **`.eslintignore`**: Archivos y carpetas que el linter no debe analizar.
* **`.prettierrc`**: Reglas de formato visual del código para mantener consistencia.
* **`README.md`**: Documentación principal del proyecto.
* **`migrate-mongo-config.js`**: Configuración de conexión para las migraciones de MongoDB.
* **`package.json`**: Registro de dependencias, información del proyecto y scripts de ejecución.

### 🌳 Árbol del Proyecto

```text
.
├── bin/
├── config/
├── middlewares/
├── migration/
├── model/
├── routes/
├── schemas/
├── utils/
├── app.js
├── .env
├── .eslintignore
├── .prettierrc
├── README.md
├── migrate-mongo-config.js
└── package.json
