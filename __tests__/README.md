# Organisation des Tests

Ce dossier contient tous les tests du projet, organisés selon leur type.

## Structure des dossiers

```
__tests__/
  unit/                  # Tests unitaires isolés
    services/            # Tests des services métier
    utils/               # Tests des fonctions utilitaires
  integration/           # Tests d'intégration
    api/                 # Tests d'API
    database/            # Tests d'intégration avec la BD
  e2e/                   # Tests end-to-end
  setup.ts               # Configuration commune des tests
  jest.unit.config.js    # Configuration Jest pour tests unitaires
  jest.integration.config.js # Configuration Jest pour tests d'intégration
  jest.e2e.config.js     # Configuration Jest pour tests e2e
```

## Types de tests

### Tests unitaires

Les tests unitaires testent des fonctions isolées. Ils sont rapides et n'utilisent pas de dépendances externes.

```bash
npm run test:unit
```

### Tests d'intégration

Les tests d'intégration vérifient que différentes parties du système fonctionnent ensemble.

```bash
npm run test:integration
```

### Tests End-to-End (E2E)

Les tests E2E vérifient les flux complets d'utilisateur.

```bash
npm run test:e2e
```

## Organisation recommandée

Pour une bonne organisation, suivez ces principes:

1. **Mirroir de la structure source**:
   - Chaque fichier de test doit refléter la structure du code source
   - Exemple: Pour tester `src/utils/validators.ts`, créez `__tests__/unit/utils/validators.test.ts`

2. **Nommage des fichiers**:
   - Chaque fichier de test doit se terminer par `.test.ts`
   - Utilisez le même nom que le fichier source pour faciliter la navigation

3. **Pattern AAA**:
   - **Arrange**: Préparation des données et de l'environnement
   - **Act**: Exécution de l'action à tester
   - **Assert**: Vérification des résultats

4. **Mocking efficace**:
   - Utilisez `jest.mock()` pour les modules complets
   - Utilisez `jest.fn()` et `jest.spyOn()` pour les fonctions spécifiques 