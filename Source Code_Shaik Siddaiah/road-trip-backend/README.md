# Road Trip Sharing Platform — Backend

Spring Boot REST API for the Road Trip Sharing Platform.
Implements the **Model** and **Controller** layers of the MVC architecture
described in the project brief: entities + database access (Model) and REST
endpoints (Controller). The **View** is a separate frontend (React / HTML+JS)
that calls this API over HTTP.

## Tech stack

| Layer | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.3 (Web, Data JPA, Security, Validation) |
| Database | MySQL 8 |
| Auth | JWT (jjwt library) + Spring Security + BCrypt |
| Build tool | Maven |

## Project layout

```
src/main/java/com/roadtrip/
 ├── config/        Spring Security configuration
 ├── security/      JWT creation/validation, auth filter, user-details adapter
 ├── model/         JPA entities (the "Model" in MVC)
 ├── repository/    Spring Data JPA interfaces (database access)
 ├── dto/           Request/response objects (what the API actually sends/receives)
 ├── service/       Business logic
 ├── controller/    REST endpoints (the "Controller" in MVC)
 └── exception/     Custom exceptions + a global JSON error handler

src/main/resources/
 ├── application.properties   DB connection, JWT settings
 ├── schema.sql                DB structure (DDL) - for manual reference/import
 └── data.sql                  Sample data dump
```

## 1. Prerequisites

- JDK 17+
- Maven 3.9+ (or use the IDE's bundled Maven)
- MySQL 8 running locally

## 2. Set up the database

**Option A — let the app create everything (recommended for local dev):**
Just set your MySQL password in `application.properties` and run the app
(step 3). `createDatabaseIfNotExist=true` + `ddl-auto=update` will create the
`roadtrip_db` schema and every table automatically from the entity classes.

**Option B — create it by hand with the provided SQL files (useful to
inspect the structure or to submit as a deliverable):**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS roadtrip_db;"
mysql -u root -p roadtrip_db < src/main/resources/schema.sql
mysql -u root -p roadtrip_db < src/main/resources/data.sql
```
Note: if you use Option B, re-running `data.sql` twice will fail with a
duplicate primary-key error (the sample rows use fixed ids) — drop and
recreate the tables first if you need a clean reset.

## 3. Configure and run

1. Open `src/main/resources/application.properties` and replace
   `<your_password>` with your real MySQL password.
2. Run it — pick whichever matches your setup:
   - **VS Code:** install the "Extension Pack for Java" and "Spring Boot
     Extension Pack" extensions, open this folder (File → Open Folder),
     wait for it to finish importing, then click the **Run** link that
     appears above `public static void main(...)` in
     `RoadTripBackendApplication.java`.
   - **IntelliJ IDEA:** open this folder as a project, then run
     `RoadTripBackendApplication.java` directly (right-click → Run).
   - **Command line (requires Maven installed separately):**
     ```bash
     mvn spring-boot:run
     ```
     This project does not ship a Maven wrapper (`mvnw`), so `mvn` must
     already be installed and on your PATH for this option.
3. The API is now live at `http://localhost:8080`.

## 4. Try it out (with the sample data loaded)

Every demo user's password is `password123` (e.g. `asha@example.com`).

```bash
# Log in and grab a token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","password":"password123"}'

# Browse public trips (no login needed)
curl http://localhost:8080/api/trips

# Get one trip's full detail, including its stops
curl http://localhost:8080/api/trips/1

# Create a trip (replace <TOKEN> with the token from login)
curl -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"My New Trip","startLocation":"Pune","endLocation":"Goa","visibility":"PUBLIC","tagNames":["beach","budget"]}'
```

A full list of every endpoint is in the project's design document
(`Road_Trip_Backend_Design_Document.docx`).

## 5. Notes for Lombok users

The entities and DTOs use Lombok (`@Getter`, `@Setter`, etc.) to avoid
hand-writing boilerplate. If you're on IntelliJ IDEA, install the **Lombok
plugin** and enable **annotation processing**
(Settings → Build, Execution, Deployment → Compiler → Annotation Processors)
or the project won't compile inside the IDE (Maven builds work regardless).
