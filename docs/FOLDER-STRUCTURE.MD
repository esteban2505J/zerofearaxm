src/
├── common/ # Cosas compartidas: exceptions globales, config, prisma.service.ts
│ ├── exceptions/ # Tus exceptions
│ └── prisma/ # PrismaService si es global
├── modules/ # Módulos por feature (aquí va el negocio)
│ ├── products/ # Feature: productos (camisetas, variants, etc.)
│ │ ├── domain/ # Capa interna: entities puras + enums
│ │ │ ├── entities/
│ │ │ │ └── product.entity.ts
│ │ │ └── enums/ # Tus enums (ej: SizeEnum)
│ │ ├── application/ # Use cases + ports (salida)
│ │ │ ├── use-cases/
│ │ │ │ ├── create-product.use-case.ts
│ │ │ │ └── update-stock.use-case.ts
│ │ │ └── ports/ # Puertos de salida (interfaces para repos, etc.)
│ │ │ └── product-repository.port.ts
│ │ ├── infrastructure/ # Adapters concretos + mappers + controllers (entrada)
│ │ │ ├── adapters/ # Tus adapters (ej: email o payment si aplican)
│ │ │ ├── repositories/
│ │ │ │ └── prisma-product.repository.ts # Implementación de port
│ │ │ ├── mappers/
│ │ │ │ └── product.mapper.ts # El que arreglamos
│ │ │ ├── controllers/ # Puertos de entrada (HTTP)
│ │ │ │ └── product.controller.ts
│ │ │ └── dtos/ # DTOs específicos (mueve de application)
│ │ │ ├── create-product.dto.ts
│ │ │ └── product-response.dto.ts
│ │ └── products.module.ts # Une todo con DI
│ ├── orders/ # Mismo patrón para órdenes (checkout, etc.)
│ │ └── ... # Repite estructura
│ └── auth/ # Módulo separado para login (admin/cliente)
│ └── ... # Simple, sin tanta subestructura al inicio
└── main.ts # Bootstrap app
