# PeakFit — Spring Boot Backend
> Remplacement 1-pour-1 du backend Node.js/Express par Java/Spring Boot.
> Le frontend React fonctionne sans aucune modification.

---

## ✅ Ce qui a été converti

| Node.js                     | Spring Boot                              |
|-----------------------------|------------------------------------------|
| `express` + routes          | `@RestController` + `@RequestMapping`    |
| `jsonwebtoken` (JWT)        | `jjwt` + `JwtService` + `JwtAuthFilter` |
| `bcrypt`                    | `BCryptPasswordEncoder` (Spring Security)|
| `mysql2` pool               | Spring Data JPA + HikariCP               |
| `.env`                      | `application.properties`                 |
| Middleware `auth.js`        | `JwtAuthFilter` + `SecurityConfig`       |
| `res.status(400).json(...)` | `ApiException` + `GlobalExceptionHandler`|

---

## 📁 Structure du projet

```
peakfit-spring/
├── pom.xml
└── src/main/
    ├── java/com/peakfit/
    │   ├── PeakFitApplication.java        ← Point d'entrée
    │   ├── config/
    │   │   └── SecurityConfig.java        ← CORS + JWT + routes publiques
    │   ├── controller/
    │   │   ├── AuthController.java
    │   │   ├── ActivityController.java
    │   │   ├── ObjectifController.java
    │   │   ├── ProgrammeController.java
    │   │   ├── NutritionController.java
    │   │   ├── NotificationController.java
    │   │   ├── RecuperationController.java
    │   │   ├── CommunauteController.java
    │   │   ├── StatsController.java
    │   │   └── HealthController.java
    │   ├── service/
    │   │   ├── AuthService.java
    │   │   ├── ActivityService.java
    │   │   ├── ObjectifService.java
    │   │   ├── ProgrammeService.java
    │   │   ├── NutritionService.java
    │   │   ├── NotificationService.java
    │   │   ├── RecuperationService.java
    │   │   ├── CommunauteService.java
    │   │   └── StatsService.java
    │   ├── repository/
    │   │   ├── UserRepository.java
    │   │   ├── ActivityRepository.java
    │   │   ├── ObjectifRepository.java
    │   │   ├── ProgrammeRepository.java
    │   │   ├── SeanceRepository.java
    │   │   ├── BlessureRepository.java
    │   │   ├── ConseilRecuperationRepository.java
    │   │   ├── NutritionRepasRepository.java
    │   │   ├── HydratationRepository.java
    │   │   ├── NotificationRepository.java
    │   │   ├── BadgeRepository.java
    │   │   └── DefiRepository.java
    │   ├── entity/
    │   │   ├── User.java, Activity.java, Objectif.java
    │   │   ├── Programme.java, Seance.java
    │   │   ├── Blessure.java, ConseilRecuperation.java
    │   │   ├── NutritionRepas.java, Hydratation.java
    │   │   ├── Notification.java
    │   │   ├── Defi.java, DefiParticipation.java
    │   │   ├── Badge.java, UserBadge.java
    │   ├── dto/
    │   │   └── (Request DTOs pour chaque endpoint)
    │   ├── security/
    │   │   ├── JwtService.java            ← Génère et valide les tokens JWT
    │   │   └── JwtAuthFilter.java         ← Filtre HTTP → extrait userId
    │   └── exception/
    │       ├── ApiException.java
    │       └── GlobalExceptionHandler.java
    └── resources/
        └── application.properties
```

---

## 🚀 Comment lancer le backend

### Prérequis
- Java 17+ (`java -version`)
- Maven 3.8+ (`mvn -version`)
- MySQL 8+ avec la base `peakfit` importée

### Étape 1 — Importer la base de données
```bash
mysql -u root -p < peakfit_database.sql
```

### Étape 2 — Configurer `application.properties`
Ouvrir `src/main/resources/application.properties` et ajuster si nécessaire :
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/peakfit?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=       ← votre mot de passe MySQL
jwt.secret=peakfit_secret_2026_change_this
frontend.url=http://localhost:3000
```

### Étape 3 — Lancer le serveur
```bash
cd peakfit-spring
mvn spring-boot:run
```
Le serveur démarre sur **http://localhost:3001** — identique au port Node.js.

### Étape 4 — Lancer le frontend (inchangé)
```bash
cd frontend
npm install
npm start
```
Le frontend React se connecte automatiquement à `http://localhost:3001`.

---

## 🔐 Authentification JWT

Le token JWT généré est **compatible** avec les tokens Node.js :
- Même secret (`peakfit_secret_2026_change_this`)
- Même payload : `{ "userId": <id>, "iat": ..., "exp": ... }`
- Même durée : 7 jours

Le frontend envoie `Authorization: Bearer <token>` — Spring le valide exactement comme Node.js.

---

## 🛣️ Routes — Correspondance complète

| Méthode | URL                                  | Auth | Description                  |
|---------|--------------------------------------|------|------------------------------|
| POST    | `/api/auth/register`                 | ❌   | Créer un compte              |
| POST    | `/api/auth/login`                    | ❌   | Se connecter                 |
| GET     | `/api/auth/me`                       | ✅   | Profil utilisateur           |
| PUT     | `/api/auth/profile`                  | ✅   | Modifier profil              |
| PUT     | `/api/auth/password`                 | ✅   | Modifier mot de passe        |
| GET     | `/api/activities`                    | ✅   | Lister activités             |
| POST    | `/api/activities`                    | ✅   | Créer activité               |
| PUT     | `/api/activities/:id`                | ✅   | Modifier activité            |
| DELETE  | `/api/activities/:id`                | ✅   | Supprimer activité           |
| GET     | `/api/stats`                         | ✅   | Dashboard stats complet      |
| GET     | `/api/objectifs`                     | ✅   | Lister objectifs             |
| POST    | `/api/objectifs`                     | ✅   | Créer objectif               |
| PUT     | `/api/objectifs/:id`                 | ✅   | Modifier objectif            |
| DELETE  | `/api/objectifs/:id`                 | ✅   | Supprimer objectif           |
| GET     | `/api/programmes`                    | ✅   | Lister programmes            |
| POST    | `/api/programmes`                    | ✅   | Créer programme              |
| PUT     | `/api/programmes/seance/:id`         | ✅   | Toggle séance fait/non-fait  |
| GET     | `/api/nutrition`                     | ✅   | Données nutrition du jour    |
| POST    | `/api/nutrition/repas`               | ✅   | Ajouter repas                |
| DELETE  | `/api/nutrition/repas/:id`           | ✅   | Supprimer repas              |
| POST    | `/api/nutrition/hydratation`         | ✅   | Ajouter hydratation          |
| GET     | `/api/notifications`                 | ✅   | Lister notifications         |
| PUT     | `/api/notifications/:id/lire`        | ✅   | Marquer lu                   |
| PUT     | `/api/notifications/lire-tout`       | ✅   | Tout marquer lu              |
| GET     | `/api/recuperation`                  | ✅   | Données récupération         |
| POST    | `/api/recuperation/blessure`         | ✅   | Créer blessure               |
| PUT     | `/api/recuperation/blessure/:id`     | ✅   | Modifier blessure            |
| PUT     | `/api/recuperation/conseil/:id`      | ✅   | Marquer conseil fait         |
| GET     | `/api/communaute`                    | ✅   | Classement + badges + défis  |
| GET     | `/api/health`                        | ❌   | Vérification serveur         |

---

## ⚙️ Architecture expliquée (pour débutants)

### Controller
Reçoit les requêtes HTTP du frontend. Extrait l'`userId` du token JWT et appelle le Service. Ne contient pas de logique métier.

### Service
Contient toute la logique métier (calculs, validations, transformations). Appelle le Repository pour accéder à la base de données.

### Repository
Interface Java qui parle à MySQL via JPA. Pas besoin d'écrire des requêtes SQL simples — Spring les génère automatiquement. Pour les requêtes complexes, on utilise `@Query` avec du SQL natif.

### Entity
Représentation Java d'une table MySQL. Ex: `Activity.java` ↔ table `activities`.

### DTO (Data Transfer Object)
Objet qui représente les données envoyées par le frontend (corps de la requête JSON). Ex: `LoginRequest` contient `email` et `password`.

### Security
- `JwtService` : crée et vérifie les tokens JWT
- `JwtAuthFilter` : intercepte chaque requête, lit le header `Authorization`, et extrait l'`userId`
- `SecurityConfig` : définit quelles routes sont publiques et lesquelles nécessitent un token

### Exception Handling
- `ApiException` : exception personnalisée avec un code HTTP (400, 401, 404, etc.)
- `GlobalExceptionHandler` : intercepte toutes les exceptions et les transforme en `{ "error": "message" }`

---

## 🗄️ Base de données

**Aucune modification** du schéma. La propriété `spring.jpa.hibernate.ddl-auto=validate` vérifie uniquement que les entités correspondent aux tables existantes — elle ne modifie rien.

---

## ❓ Problèmes courants

| Problème | Solution |
|----------|----------|
| `Communications link failure` | MySQL n'est pas démarré ou mauvais host/port |
| `Access denied for user` | Vérifier `spring.datasource.username/password` |
| `SchemaManagementException` | La base n'est pas importée — relancer `mysql < peakfit_database.sql` |
| Port 3001 déjà utilisé | Arrêter le backend Node.js avant de lancer Spring |
| CORS error dans le navigateur | Vérifier que `frontend.url=http://localhost:3000` correspond au port du React |
