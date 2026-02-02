export class Category {
  constructor(
    public id: string,
    public name: string,
    public slug?: string,

    // Opcionales: Solo si tu lógica de negocio las necesita.
    // Por lo general, 'createdAt' y 'updatedAt' se quedan en la DB/Infraestructura
    // y no se traen al dominio a menos que vayas a ordenar por fecha o mostrar "Nuevo".
    public createdAt?: Date,
    public updatedAt?: Date,
  ) { }
}