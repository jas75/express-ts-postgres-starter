# Stratégie de test

Ce document décrit la stratégie de test mise en place pour le projet Express TypeScript PostgreSQL.

## Organisation des tests

La structure des tests est organisée comme suit:

```
__tests__/
  unit/                  # Tests unitaires isolés
    services/            # Tests des services métier
    utils/               # Tests des fonctions utilitaires
  integration/           # Tests d'intégration
    api/                 # Tests d'API
    controllers/         # Tests des contrôleurs
    database/            # Tests d'intégration avec la BD
  e2e/                   # Tests end-to-end
  setup.ts               # Configuration commune des tests
```

## Types de tests

### Tests unitaires

Les tests unitaires vérifient le comportement de chaque unité de code isolément. Ils utilisent des mocks pour simuler les dépendances.

**Caractéristiques:**
- Tests rapides et légers
- Indépendants de l'environnement externe
- Utilisent des mocks pour les dépendances
- Se concentrent sur une seule fonction/méthode

**Exemples:**
- Tests des validateurs (Zod)
- Tests des fonctions utilitaires
- Tests des services avec dépendances mockées

### Tests d'intégration

Les tests d'intégration vérifient que différentes parties du système fonctionnent ensemble correctement.

**Caractéristiques:**
- Plus lents que les tests unitaires
- Testent l'interaction entre différents composants
- Peuvent utiliser des mocks pour certaines dépendances

**Exemples:**
- Tests des APIs REST
- Tests des contrôleurs avec leurs services
- Tests d'intégration avec la base de données réelle

### Tests End-to-End (E2E)

Les tests E2E vérifient le comportement de l'application du point de vue de l'utilisateur.

**Caractéristiques:**
- Plus lents et plus complexes
- Testent des flux complets d'utilisation
- Utilisent si possible l'environnement réel de l'application

**Exemples:**
- Flux complet d'authentification
- Flux CRUD sur les ressources

## Configuration de l'environnement de test

- **Environnement**: Utilisation d'un fichier `.env.test` pour les tests.
- **Base de données**: Base de données de test dédiée pour les tests d'intégration/E2E.
- **Jest**: Configuration personnalisée avec coverage, timeouts, etc.

## Bonnes pratiques

1. **Isolation**: Chaque test doit être indépendant et ne pas dépendre d'autres tests.
2. **Mocks**: Utilisez des mocks pour isoler les composants et simuler les dépendances.
3. **Setup/Teardown**: Nettoyez l'environnement avant et après chaque test.
4. **Nommage**: Utilisez des noms explicites décrivant le comportement attendu.
5. **AAA Pattern**:
   - **Arrange**: Préparation des données et de l'environnement
   - **Act**: Exécution de l'action à tester
   - **Assert**: Vérification des résultats

## Exécution des tests

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage
```

## Intégration continue

Les tests sont exécutés automatiquement lors des push/PR dans le repository, avec:
- Vérification de la couverture de code (minimum 70%)
- Exécution des tests unitaires et d'intégration
- Vérification du linting et du formatting

## Mocking

Nous utilisons plusieurs approches de mocking:

1. **Jest mock functions**: `jest.fn()`, `jest.spyOn()`
2. **Mock modules**: `jest.mock()`
3. **Mock manual implementation**: Simuler les comportements spécifiques

## Ressources

- [Documentation Jest](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/ladjs/supertest)
- [Test Isolation](https://kentcdodds.com/blog/test-isolation-with-react) 