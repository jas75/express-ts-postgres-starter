import { db } from '../../../src/core/database/postgresql';

describe('Database Integration Tests', () => {
  // Données de test
  const testUser = {
    email: `db-test-${Date.now()}@example.com`,
    password: '$2b$10$dummyhashedpassword',
    first_name: 'DB',
    last_name: 'Test',
    role: 'user',
  };
  let userId: string;

  // Nettoyer les données de test après tous les tests
  afterAll(async () => {
    // Supprimer l'utilisateur créé pour le test
    if (userId) {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });

  it('should insert a new user in the database', async () => {
    // Insertion d'un nouvel utilisateur dans la base de données de test
    const insertResult = await db.query(
      `INSERT INTO users (email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, first_name, last_name, role`,
      [testUser.email, testUser.password, testUser.first_name, testUser.last_name, testUser.role],
    );

    // Vérifier que l'insertion a fonctionné
    expect(insertResult.rows.length).toBe(1);
    expect(insertResult.rows[0]).toHaveProperty('email', testUser.email);

    // Sauvegarder l'ID pour les tests suivants et le nettoyage
    userId = insertResult.rows[0].id as string;
  });

  it('should retrieve the inserted user from the database', async () => {
    // Récupérer l'utilisateur inséré précédemment
    const selectResult = await db.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId],
    );

    // Vérifier que l'utilisateur existe et a les bonnes données
    expect(selectResult.rows.length).toBe(1);
    expect(selectResult.rows[0]).toEqual(
      expect.objectContaining({
        id: userId,
        email: testUser.email,
        first_name: testUser.first_name,
        last_name: testUser.last_name,
        role: testUser.role,
      }),
    );
  });

  it('should update user data in the database', async () => {
    // Mettre à jour certaines données de l'utilisateur
    const updatedFirstName = 'UpdatedName';

    const updateResult = await db.query(
      'UPDATE users SET first_name = $1 WHERE id = $2 RETURNING id, email, first_name, last_name, role',
      [updatedFirstName, userId],
    );

    // Vérifier que la mise à jour a fonctionné
    expect(updateResult.rows.length).toBe(1);
    expect(updateResult.rows[0]).toHaveProperty('first_name', updatedFirstName);
    expect(updateResult.rows[0]).toHaveProperty('email', testUser.email);
  });

  it('should delete the user from the database', async () => {
    // Supprimer l'utilisateur
    const deleteResult = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

    // Vérifier que la suppression a fonctionné
    expect(deleteResult.rows.length).toBe(1);
    expect(deleteResult.rows[0]).toHaveProperty('id', userId);

    // Vérifier que l'utilisateur n'existe plus
    const checkResult = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    expect(checkResult.rows.length).toBe(0);

    // L'utilisateur est déjà supprimé, pas besoin de le faire dans afterAll
    userId = '';
  });
});
