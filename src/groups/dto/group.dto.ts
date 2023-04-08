export class CreateGroupDto {
  readonly sku: string;
  readonly name: string;
  readonly description: string;
  readonly perms: string[];
}

export class UpdateGroupDto {
  readonly name: string;
  readonly description: string;
  readonly perms: string[];
}
