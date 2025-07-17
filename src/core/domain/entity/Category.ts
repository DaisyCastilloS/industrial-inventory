import { BaseEntity, IBaseEntity } from './base/BaseEntity';

type CategoryName = string & { readonly category: unique symbol };

export type { CategoryName };

export interface ICategory extends IBaseEntity {
  name: string;
  description?: string;
  parentId?: number;
}

export class Category extends BaseEntity {
  private _name: CategoryName;
  private _description?: string;
  private _parentId?: number;

  constructor(data: ICategory) {
    super(data);
    this.validateCategoryData(data);
    this._name = data.name as CategoryName;
    this._description = data.description;
    this._parentId = data.parentId;
  }

  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get parentId(): number | undefined {
    return this._parentId;
  }

  public isRootCategory(): boolean {
    return this._parentId === undefined || this._parentId === null;
  }

  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as CategoryName;
    this.touch();
  }

  public updateDescription(newDescription?: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touch();
  }

  public setParent(newParentId?: number): void {
    if (newParentId !== undefined && newParentId < 0) {
      throw new Error('El parentId debe ser positivo');
    }
    this._parentId = newParentId;
    this.touch();
  }

  private validateCategoryData(data: ICategory): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateParentId(data.parentId);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error(
        'El nombre de la categoría debe tener al menos 2 caracteres'
      );
    }
    if (name.length > 100) {
      throw new Error(
        'El nombre de la categoría no puede exceder 100 caracteres'
      );
    }
  }

  private validateDescription(description?: string): void {
    if (description && description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
  }

  private validateParentId(parentId?: number): void {
    if (parentId !== undefined && parentId < 0) {
      throw new Error('El parentId debe ser positivo');
    }
  }

  public toJSON(): ICategory {
    return {
      ...super.toJSON(),
      name: this._name,
      description: this._description,
      parentId: this._parentId,
    };
  }
}
