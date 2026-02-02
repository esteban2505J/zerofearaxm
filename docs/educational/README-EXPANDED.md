📚 # Carpeta Educativa / Educational Materials

> Materiales de aprendizaje personal - Personal learning materials

## 🎓 ¿Qué es esto?

Esta carpeta contiene **guías enfocadas en la enseñanza** que te explican **cómo hacer las cosas**, no solo **qué hicimos**.

Es tu espacio personal de aprendizaje. Está diseñado para ayudarte a:

- Entender el POR QUÉ detrás de cada decisión
- Aprender paso a paso cómo construir esto desde cero
- Estudiar en profundidad los enfoques de testing
- Progresar a través de niveles de dominio

## 📖 Documentos

### 1. **LEARNING-PATH.md** 📚

**5 niveles progresivos de principiante a experto**

- Nivel 1: Fundamentals - Entender endpoints (1-2h)
- Nivel 2: Intermediate - Repositorios y patrones (2-3h)
- Nivel 3: Testing - Testing E2E (2-3h)
- Nivel 4: Application - Construir CRUD completo (3-4h)
- Nivel 5: Expert - Entender todo (4-6h)

**Tiempo total:** 12-18 horas para dominio completo

**Úsalo para:** Entender dónde estás en tu aprendizaje y qué sigue

---

### 2. **STEP-BY-STEP-GUIDE.md** 👣

**Tutorial práctico para reproducir todo desde cero**

Dividido en 6 partes:

- **Parte 1:** Clean Architecture + Repository Pattern
  - Crear interfaz del repositorio
  - Crear entidades de dominio
  - Implementar con Prisma
  - Configurar inyección de dependencias

- **Parte 2:** DTOs y Validación
  - Crear DTOs con validadores
  - Agregar ValidationPipe global

- **Parte 3:** Controllers y Endpoints
  - Crear controller
  - Exponer endpoints HTTP

- **Parte 4:** Setup de Testing E2E
  - Configurar Jest
  - Variables de entorno
  - Scripts en package.json

- **Parte 5:** Escribir Test E2E Completo
  - Test file completo
  - Tests individuales

- **Parte 6:** Ejecutar Tests
  - Comandos y resultados

**Úsalo para:** Construir esto en otro proyecto o aprender haciendo

---

### 3. **TESTING-GUIDE.md** 🧪

**Guía completa de Testing E2E con Supertest**

11 secciones detalladas:

1. Conceptos Fundamentales (pirámide de testing)
2. Setup del Ambiente (Jest, variables de entorno)
3. Estructura de un Test E2E (template)
4. Escribiendo Tests Individuales (POST, GET, 404)
5. Métodos de Supertest (GET, POST, PUT, DELETE)
6. Assertions Comunes en Jest
7. Data Sharing Entre Tests
8. Setup y Teardown (beforeAll, afterAll, etc)
9. Testing Edge Cases
10. Running Tests (comandos)
11. Troubleshooting Común (problemas comunes)

**Úsalo para:** Entender testing en profundidad y resolver problemas

---

## 🎯 Cómo Usar Esta Carpeta

### Camino 1: Aprender desde cero (Recomendado primera vez)

1. Lee **LEARNING-PATH.md** (elige tu nivel)
2. Sigue **STEP-BY-STEP-GUIDE.md** (hazlo tú mismo)
3. Consulta **TESTING-GUIDE.md** al escribir tests

### Camino 2: Deep dive en testing

1. Lee **TESTING-GUIDE.md** (entiende conceptos)
2. Aplica con **STEP-BY-STEP-GUIDE.md** (Parte 5)

### Camino 3: Referencia y copiar patrones

1. Ve a **STEP-BY-STEP-GUIDE.md**
2. Encuentra la parte que necesitas
3. Copia y adapta

### Camino 4: Consolidar lo aprendido

1. Lee **LEARNING-PATH.md** nivel 5 (Expert)
2. Completa el checklist
3. Intenta reproducir sin consultar las guías

---

## 📚 Enlaces a Documentación Oficial

Si necesitas referencia técnica oficial o resumen visual:

- [../TECHNICAL-DOCUMENTATION.md](../TECHNICAL-DOCUMENTATION.md) - Referencia técnica completa
- [../ARCHITECTURE-SUMMARY.md](../ARCHITECTURE-SUMMARY.md) - Diagramas visuales y referencia rápida
- [../README-DOCUMENTATION.md](../README-DOCUMENTATION.md) - Índice principal y navegación

---

## ✅ Checklist: Qué Aprenderás

Después de completar este material, sabrás:

- [ ] Cómo Clean Architecture separa responsabilidades
- [ ] Cómo implementar Repository Pattern
- [ ] Cómo usar Dependency Injection en NestJS
- [ ] Cómo crear DTOs y validar datos
- [ ] Cómo escribir tests E2E con Supertest
- [ ] Cómo usar assertions de Jest
- [ ] Cómo diseñar flujo de datos en tests
- [ ] Cómo manejar setup/teardown
- [ ] Cómo funciona Prisma con migraciones
- [ ] Cómo estructurar un proyecto NestJS correctamente

---

## 🚀 Después de Aprender

Una vez que entiendas todo:

1. **Refuerza:** Construye el mismo proyecto de memoria
2. **Expande:** Agrega más módulos (Users, Orders, Categories)
3. **Desafío:** Implementa sin consultar las guías
4. **Enseña:** Explica cada concepto a alguien más
5. **Escala:** Agrega autenticación, paginación, filtrado

---

## 💡 Tips de Aprendizaje

- **No solo leas**, escribe el código tú mismo
- **No saltes tests**, te enseñan patrones
- **Sigue el patrón AAA** (Arrange, Act, Assert) siempre
- **Limpia datos después de tests** siempre
- **Pregúntate POR QUÉ** para cada decisión
- **Refactoriza después de aprender**, no solo copies

---

## 🤔 Confundido en Algo?

| Tema                 | Guía                  | Sección    |
| -------------------- | --------------------- | ---------- |
| Clean Architecture   | STEP-BY-STEP-GUIDE.md | Parte 1    |
| Repository Pattern   | STEP-BY-STEP-GUIDE.md | Parte 1    |
| Dependency Injection | STEP-BY-STEP-GUIDE.md | Parte 1.4  |
| DTOs                 | STEP-BY-STEP-GUIDE.md | Parte 2    |
| Validación           | STEP-BY-STEP-GUIDE.md | Parte 2.2  |
| Controllers          | STEP-BY-STEP-GUIDE.md | Parte 3    |
| Setup Testing        | STEP-BY-STEP-GUIDE.md | Parte 4    |
| Escribir Tests       | TESTING-GUIDE.md      | Sección 4  |
| Assertions           | TESTING-GUIDE.md      | Sección 6  |
| Problemas            | TESTING-GUIDE.md      | Sección 11 |

---

## 📊 Resumen de Documentación

```
/docs
├── TECHNICAL-DOCUMENTATION.md     (Referencia oficial)
├── ARCHITECTURE-SUMMARY.md         (Diagramas visuales)
├── README-DOCUMENTATION.md         (Índice principal)
└── /educational                    (Tu espacio de aprendizaje)
    ├── README.md                  (Este archivo - versión simple)
    ├── README-EXPANDED.md         (Versión expandida)
    ├── LEARNING-PATH.md           (Mapa de aprendizaje)
    ├── STEP-BY-STEP-GUIDE.md      (Tutorial práctico)
    └── TESTING-GUIDE.md           (Guía de testing)
```

---

## ⏰ Tiempo Estimado

| Documento             | Lectura | Ejercicios | Total      |
| --------------------- | ------- | ---------- | ---------- |
| LEARNING-PATH.md      | 30 min  | -          | 30 min     |
| STEP-BY-STEP-GUIDE.md | 30 min  | 3-4h       | 3.5-4.5h   |
| TESTING-GUIDE.md      | 40 min  | 2-3h       | 2.5-3.5h   |
| Práctica adicional    | -       | 4-8h       | 4-8h       |
| **TOTAL**             | -       | -          | **12-18h** |

---

**Recuerda:** Esta carpeta es para tu viaje de aprendizaje. Tómate tu tiempo, entiende cada concepto, y construye proyectos para reforzar tu conocimiento. 🎓

¡Bienvenido a tu aprendizaje! Learning path disponible en LEARNING-PATH.md
