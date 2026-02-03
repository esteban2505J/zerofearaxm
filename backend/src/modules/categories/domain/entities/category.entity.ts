export class Category {
  constructor(
    public id: string,
    public name: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name is required');
    }
  }
}
