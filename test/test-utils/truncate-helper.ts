import { DataSource } from 'typeorm';

/**
 * Lista das entidades na ordem correta para exclusão (do filho para o pai).
 * Isso evita erro de chave estrangeira.
 */
export async function clearDatabase(
  dataSource: DataSource,
  entities: Function[],
) {
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity as any);
    await repository.createQueryBuilder().delete().from(entity).execute();
  }
}
