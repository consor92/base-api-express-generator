# base-api-express-generator

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

.env.development (example)

```
ENV=development
PORT=4000
MONGO_URL=mongodb://127.0.0.1:27017/
MONGO_URL_AUTH_ENABLED=mongodb://user:password@127.0.0.1:27017/
MONGO_DB=base-api-express-generator
```
