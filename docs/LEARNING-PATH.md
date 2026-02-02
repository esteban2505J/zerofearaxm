# 🗺️ Mapa de Aprendizaje: De Principiante a Experto

> Ruta de aprendizaje estructurada con recursos

---

## NIVEL 1: Fundamentos (1-2 horas)

### 🎯 Objetivos

- Entender qué es NestJS
- Entender qué es un Controller
- Entender qué es un Repository
- Ver por primera vez Clean Architecture

### 📚 Lectura Recomendada

1. [ARCHITECTURE-SUMMARY.md](./ARCHITECTURE-SUMMARY.md) - Sección "Flujo Completo"
2. [TECHNICAL-DOCUMENTATION.md](./TECHNICAL-DOCUMENTATION.md) - Sección "Arquitectura General"

### 💻 Ejercicio Práctico

```typescript
// Crear un controller simple
@Controller("hello")
export class HelloController {
  @Get()
  getHello() {
    return { message: "Hello World" };
  }
}

// Test
it("should return hello message", async () => {
  const res = await request(app.getHttpServer()).get("/hello");
  expect(res.body.message).toBe("Hello World");
});
```

### ✅ Conceptos Clave

- [ ] ¿Qué es @Controller?
- [ ] ¿Qué es @Get, @Post, @Put, @Delete?
- [ ] ¿Qué es un endpoint?
- [ ] ¿Cómo hacer un test básico?

---

## NIVEL 2: Conceptos Intermedios (2-3 horas)

### 🎯 Objetivos

- Entender Repository Pattern
- Entender Dependency Injection
- Entender cómo separar lógica en capas
- Entender DTOs y validación

### 📚 Lectura Recomendada

1. [TECHNICAL-DOCUMENTATION.md](./TECHNICAL-DOCUMENTATION.md) - Secciones 3 y 7
2. [STEP-BY-STEP-GUIDE.md](./STEP-BY-STEP-GUIDE.md) - Partes 1 y 2

### 💻 Ejercicio Práctico

```typescript
// 1. Crear interfaz (contrato)
export interface IHelloRepository {
  greet(name: string): Promise<string>;
}

// 2. Crear implementación
@Injectable()
export class HelloRepository implements IHelloRepository {
  async greet(name: string): Promise<string> {
    return `Hello, ${name}!`;
  }
}

// 3. Inyectar en controller
@Controller("hello")
export class HelloController {
  constructor(
    @Inject("HELLO_REPOSITORY")
    private repository: IHelloRepository,
  ) {}

  @Get(":name")
  async greet(@Param("name") name: string) {
    return this.repository.greet(name);
  }
}

// 4. DTO con validación
export class GreetDto {
  @IsString()
  @Length(1, 50)
  name: string;
}
```

### ✅ Conceptos Clave

- [ ] ¿Qué es una interfaz?
- [ ] ¿Qué es @Injectable()?
- [ ] ¿Qué es @Inject()?
- [ ] ¿Qué es un DTO?
- [ ] ¿Por qué validar en el DTO?

---

## NIVEL 3: Testing (2-3 horas)

### 🎯 Objetivos

- Entender E2E testing
- Entender Supertest
- Escribir tests que prueben el flujo completo
- Entender AAA (Arrange-Act-Assert)

### 📚 Lectura Recomendada

1. [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Todo
2. [STEP-BY-STEP-GUIDE.md](./STEP-BY-STEP-GUIDE.md) - Parte 5

### 💻 Ejercicio Práctico

```typescript
describe("Hello (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should greet with name", async () => {
    // ARRANGE
    const name = "John";

    // ACT
    const res = await request(app.getHttpServer()).get(`/hello/${name}`);

    // ASSERT
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Hello, John!",
    });
  });
});
```

### ✅ Conceptos Clave

- [ ] ¿Qué es E2E testing?
- [ ] ¿Cómo usar Supertest?
- [ ] ¿Qué es AAA?
- [ ] ¿Cuándo usar beforeAll/afterAll?
- [ ] ¿Cómo hacer assertions?

---

## NIVEL 4: Aplicar Todo (3-4 horas)

### 🎯 Objetivos

- Reproducir el proyecto completo
- Entender cada componente
- Hacer tu propio proyecto similar
- Tests que pasen

### 📚 Lectura Recomendada

1. [STEP-BY-STEP-GUIDE.md](./STEP-BY-STEP-GUIDE.md) - Completo

### 💻 Proyecto: E-Commerce Products

```
Crear un CRUD de productos con:
✅ Controller con 6 endpoints
✅ Repository con interfaz
✅ DTOs con validación
✅ 7 tests E2E que pasen
✅ BD con Prisma
```

**Checklist:**

- [ ] Controller creado
- [ ] Repository creado
- [ ] DTOs con validación
- [ ] Tests E2E escritos
- [ ] Tests pasando
- [ ] Swagger documentado

---

## NIVEL 5: Dominio Completo (Proyecto Real)

### 🎯 Objetivos

- Entender el código completo del proyecto
- Poder explicar cada decisión
- Poder extender el proyecto
- Poder crear proyectos similares

### 📚 Lectura Recomendada

1. [TECHNICAL-DOCUMENTATION.md](./TECHNICAL-DOCUMENTATION.md) - Completo
2. [ARCHITECTURE-SUMMARY.md](./ARCHITECTURE-SUMMARY.md) - Completo
3. Código fuente en src/modules/products/

### 💻 Desafíos Progresivos

#### Desafío 1: Agregar actualización

```typescript
// Agregar endpoint PUT
@Put(':id')
async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
  // Implementar
}

// Escribir test
it('should update a product', async () => {
  // Escribir test
});
```

#### Desafío 2: Agregar paginación

```typescript
// GET /products?page=1&limit=10
// Retornar: { data: [], total: 100, page: 1 }
```

#### Desafío 3: Agregar filtrado

```typescript
// GET /products?categoryId=uuid
// Retornar solo productos de esa categoría
```

#### Desafío 4: Agregar sorting

```typescript
// GET /products?sort=price&order=asc
// Retornar ordenados por precio
```

#### Desafío 5: Agregar búsqueda

```typescript
// GET /products/search?q=laptop
// Buscar en name y description
```

### ✅ Conceptos Avanzados

- [ ] Paginación
- [ ] Filtrado
- [ ] Sorting
- [ ] Búsqueda
- [ ] Relaciones entre tablas
- [ ] Transacciones
- [ ] Índices en BD

---

## 🚦 Progreso Visual

```
NIVEL 1: Fundamentos
████░░░░░░ 40% del camino
└─ Conoces los basics

NIVEL 2: Intermedios
████████░░ 60% del camino
└─ Entiendes la arquitectura

NIVEL 3: Testing
██████████ 80% del camino
└─ Puedes testear código

NIVEL 4: Aplicar Todo
███████████ 90% del camino
└─ Puedes crear proyectos

NIVEL 5: Dominio Completo
████████████ 100% 🎉
└─ Eres experto
```

---

## ⏱️ Tiempo Total Estimado

| Nivel   | Tiempo | Acumulado |
| ------- | ------ | --------- |
| Nivel 1 | 1-2h   | 1-2h      |
| Nivel 2 | 2-3h   | 3-5h      |
| Nivel 3 | 2-3h   | 5-8h      |
| Nivel 4 | 3-4h   | 8-12h     |
| Nivel 5 | 4-6h   | 12-18h    |

**Total:** 12-18 horas para ser completamente competente

---

## 📖 Tabla de Contenidos Rápida

### Por Concepto

| Concepto             | Documento               | Sección  |
| -------------------- | ----------------------- | -------- |
| Clean Architecture   | TECHNICAL-DOCUMENTATION | 1        |
| Repository Pattern   | TECHNICAL-DOCUMENTATION | 3.1      |
| Dependency Injection | TECHNICAL-DOCUMENTATION | 3.2      |
| Entity Mapping       | TECHNICAL-DOCUMENTATION | 3.3      |
| DTOs & Validation    | TECHNICAL-DOCUMENTATION | 7        |
| E2E Testing          | TESTING-GUIDE           | Completo |
| Supertest            | TESTING-GUIDE           | 6        |
| Assertions           | TESTING-GUIDE           | 5        |
| Prisma               | TECHNICAL-DOCUMENTATION | 8        |
| Swagger              | TECHNICAL-DOCUMENTATION | 9        |

### Por Tarea

| Tarea                  | Documento            | Sección    |
| ---------------------- | -------------------- | ---------- |
| Reproducir proyecto    | STEP-BY-STEP-GUIDE   | Partes 1-6 |
| Entender flujo request | ARCHITECTURE-SUMMARY | 1          |
| Entender arquitectura  | ARCHITECTURE-SUMMARY | 2          |
| Entender validación    | ARCHITECTURE-SUMMARY | 3          |
| Escribir test          | TESTING-GUIDE        | 4          |
| Ver referencia rápida  | ARCHITECTURE-SUMMARY | Completo   |

---

## 🎓 Pre-requisitos Necesarios

### Antes de comenzar, deberías saber:

- [ ] JavaScript/TypeScript básico
- [ ] Conceptos de POO (clases, interfaces)
- [ ] HTTP básico (GET, POST, PUT, DELETE)
- [ ] SQL básico (SELECT, INSERT, UPDATE, DELETE)
- [ ] Línea de comandos (cd, npm, git)

### Sería bueno saber:

- [ ] Decoradores de TypeScript (@Entity, etc)
- [ ] Promises y async/await
- [ ] Node.js básico
- [ ] Express (opcional)

### Opcional pero útil:

- [ ] Git
- [ ] Docker
- [ ] Testing (Jest)
- [ ] Postman

---

## 📝 Notas de Estudio

### Mientras lees:

1. **Anota palabras clave** que no entiendas
2. **Haz preguntas** sobre por qué se hace así
3. **Escribe pseudocódigo** antes de escribir código real
4. **Dibuja diagramas** para visualizar flujos
5. **Lee el código** del proyecto junto a la documentación

### Mientras practicas:

1. **No copies/pegues**, escribe código manualmente
2. **Comprende cada línea** antes de pasar a la siguiente
3. **Experimenta**, cambia valores, ve qué pasa
4. **Rompe cosas a propósito** para aprender del error
5. **Comenta tu código** explicando qué hace

### Después de terminar:

1. **Explica con tus palabras** lo que aprendiste
2. **Enseña a alguien más** lo que sabes
3. **Crea un proyecto propio** similar
4. **Agrega features** nuevas
5. **Revisa código** de otros proyectos

---

## 💡 Tips de Aprendizaje

### "No entiendo esto"

1. Lee la sección recomendada
2. Mira el código fuente en src/
3. Dibuja un diagrama
4. Escribe pseudocódigo
5. Imprime y anota

### "¿Por qué se hace así?"

1. Lee la sección "¿Por qué?" del documento
2. Mira ejemplos antes/después
3. Piensa en las alternativas
4. Entiende los trade-offs

### "No sé qué hace este código"

1. Ejecuta un test
2. Agrega console.log()
3. Usa debugger en VS Code
4. Lee comentarios en el código
5. Busca en la documentación

### "No puedo hacer que funcione"

1. Revisa los tipos (TypeScript)
2. Revisa los errores en terminal
3. Consulta [TESTING-GUIDE.md](./TESTING-GUIDE.md#11-troubleshooting-común)
4. Busca en Google el error
5. Pregunta en comunidades

---

## 🎯 Objetivos por Nivel

### Nivel 1 - Deberías poder:

- [ ] Explicar qué es NestJS
- [ ] Crear un controller simple
- [ ] Escribir un test E2E simple
- [ ] Entender qué es un endpoint

### Nivel 2 - Deberías poder:

- [ ] Explicar Repository Pattern
- [ ] Crear una interfaz y una implementación
- [ ] Explicar Dependency Injection
- [ ] Crear y usar DTOs
- [ ] Validar datos en DTOs

### Nivel 3 - Deberías poder:

- [ ] Escribir tests E2E
- [ ] Usar Supertest
- [ ] Escribir assertions
- [ ] Hacer setup/teardown
- [ ] Testear cases de error

### Nivel 4 - Deberías poder:

- [ ] Crear un proyecto completo
- [ ] Implementar CRUD completo
- [ ] Escribir 7+ tests
- [ ] Todos los tests pasen
- [ ] Swagger documentado

### Nivel 5 - Deberías poder:

- [ ] Explicar cada decisión de arquitectura
- [ ] Extender el proyecto
- [ ] Crear proyectos similares
- [ ] Mentorizar a otros
- [ ] Entender código complejo

---

## 📚 Recursos Adicionales

### Oficial

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Community

- [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs)
- [GitHub Issues](https://github.com/nestjs/nest/issues)
- [Reddit r/learnprogramming](https://reddit.com/r/learnprogramming)

### Videos (si prefieres video)

- "NestJS Tutorial" en YouTube
- "Clean Architecture" en YouTube
- "Testing in NestJS" en YouTube

---

## ✨ Resumen Final

```
START → NIVEL 1 → NIVEL 2 → NIVEL 3 → NIVEL 4 → NIVEL 5 → ¡EXPERTO!

12-18 horas de aprendizaje
+ Práctica
+ Proyectos propios
= Competencia completa en NestJS + Testing + Clean Architecture
```

**¡Ahora sí, comienza tu viaje! 🚀**
