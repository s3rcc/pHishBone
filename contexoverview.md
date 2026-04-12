Here is the comprehensive project context document formatted in Markdown. You can save this as `PROJECT_CONTEXT.md` or `AI_INSTRUCTIONS.md` in your root folder.

This document is optimized for AI coding assistants (like Cursor, Windsurf, or GitHub Copilot) to understand your architectural constraints and business logic immediately.

---

# Project Context: AquaScaper

## 1. Project Overview

**AquaScaper** is a domain-specific platform for aquarium hobbyists. It combines a rigorous biological compatibility calculator (similar to *AqAdvisor*) with deep species data (similar to *SeriouslyFish*) and modern social networking features.

**Core Value Proposition:**

1. **Scientific Calculation:** Prevents users from killing fish by calculating bio-load, environmental compatibility, and aggressive behaviors.
2. **Verified Showcase:** Users can share their tanks, and the system automatically stamps a "Safety Score" snapshot on the post based on calculation logic.

---

## 2. Technical Stack & Standards

### Architecture

* **Pattern:** **Clean Architecture** (Modular Monolith approach).
* **Layers:**
1. **Domain:** Pure entities, enums, value objects, exceptions (No dependencies).
2. **Application:** Interfaces, DTOs, CQRS (optional) or Services, Validators (`FluentValidation`).
3. **Infrastructure:** EF Core implementation, External Services (Supabase), Repositories.
4. **API:** Controllers, Middleware, Presentation logic.



### Technology Stack

* **Framework:** .NET 8 (Web API).
* **Database:** PostgreSQL 16+ (Hosted on **Supabase**).
* **ORM:** Entity Framework Core (Code First approach).
* **Authentication:** Supabase Auth (JWT handling via `Microsoft.AspNetCore.Authentication.JwtBearer`).
* **Data Access:** Generic Repository Pattern + Unit of Work.
* **Logging:** Serilog.
* **Validation:** FluentValidation.
* **Error Handling:** Custom Global Exception Middleware.

### Crucial Development Rules

1. **Supabase Usage:** Supabase is used strictly as a **Database** (PostgreSQL) and **Auth Provider**. Do **NOT** use Supabase Edge Functions, Row Level Security (RLS) policies, or PostgREST APIs for business logic. All logic must reside in the .NET Application layer.
2. **Dependency Injection:** Strict DI. No `new` keywords for services.
3. **Mapping:** Use Mapper (e.g., Mapster or AutoMapper) for Entity <-> DTO conversion.

---

## 3. Database Schema Strategy (DDD)

The database is vertically partitioned into logical schemas to ensure scalability and decoupling.

### Schema: `catalog` (Read-Heavy)

* **`Species`**: Core identity (Id, Name, Type, Thumbnail).
* **`SpeciesParams`**: Calculation data (pH range, Temp range, Adult Size, Bio-load index).
* **`SpeciesProfile`**: Detailed text info (Description, Origin, Diet).
* **`Tags`**: Behavior traits (e.g., `FIN_NIPPER`, `PREDATOR`, `SCHOOLING`).
* **`SpeciesTags`**: Many-to-many link between Species and Tags.
* **`CompatibilityRules`**: Logic matrix (SubjectTag + ObjectTag = Severity/Message).
* **`Products`**: Equipment data (Filters, Lights) with `JSONB` specs.

### Schema: `identity` (Auth)

* **`Users`**: Synced from Supabase Auth (Id, Email).
* **`Profiles`**: Public info (DisplayName, Avatar, ExperienceLevel).

### Schema: `project` (Write-Heavy)

* **`Tanks`**: User projects (Dimensions, NetVolume).
* **`TankItems`**: Items inside a tank (Species/Products, Quantity).
* **`Snapshots`**: Frozen calculation results (SafetyScore, Warnings) for quick read access.

### Schema: `social` (High Volume)

* **`Posts`**: Community shares (Content, MediaUrls, linked to a Snapshot).
* **`Interactions`**: Likes, Bookmarks.
* **`Comments`**: Discussions.

---

## 4. Key Business Logic & Algorithms

The AI must implement these specific algorithms in the `Application` layer.

### 4.1. The Bio-load Algorithm

Logic to determine if the filter can handle the fish waste.

* **Input:** List of Species (AdultSize, BioLoadFactor, Quantity) + Filter Capacity.
* **Formula:** `TotalLoad = SUM(Quantity * AdultSize * BioLoadFactor)`
* **Validation:** Compare `TotalLoad` against `FilterCapacity` (normalized).

### 4.2. Environmental Intersection

Logic to ensure all species can survive in the same water.

* **Input:** List of Species (Min/Max pH, Min/Max Temp).
* **Formula:** Calculate the mathematical **Intersection** of all ranges.
* **Result:**
* If Intersection is empty -> **Critical Error**.
* If valid -> Return the `SafeRange`.



### 4.3. Tag-Based Compatibility Engine (The "Brain")

Logic to check behavioral aggression.

* **Input:** List of Species in the tank.
* **Process:**
1. Retrieve all `Tags` for every species.
2. Perform a Pairwise Check (Loop A vs B).
3. Query `CompatibilityRules` where `SubjectTag` = A.Tags and `ObjectTag` = B.Tags.


* **Example:** If A has `PREDATOR` and B has `SMALL`, Trigger **DANGER**.

### 4.4. Tank Physics

* **Net Water Volume:** Must calculate volume based on dimensions MINUS substrate height and hardscape displacement (~15%).
* **Swimming Space:** Check if bottom-dwelling fish count exceeds bottom surface area.

---

## 5. Module/Feature Context

### Module: Catalog (Knowledge Base)

* **Functions:**
* CRUD Species (Admin/Knowledge Manager).
* Manage Compatibility Rules.
* **Advanced Search:** Filter by pH, Temp, Size, Behavior.



### Module: Tank Builder (The Core Tool)

* **Functions:**
* Create Tank (Define Dimensions).
* Add/Remove Inhabitants (Real-time recalculation).
* **"Check Health"**: Run the 3 algorithms (Bio-load, Env, Compatibility) and return a `SafetyScore` (0-100%).
* Suggest Equipment (Filter/Light) based on volume/plants.



### Module: Community

* **Functions:**
* **Publish Tank:** Converts a `Tank` project into a `Post`. *Crucially: It must snapshot the current SafetyScore so the post remains valid even if the user changes the tank later.*
* **Clone Tank:** Copies `Tank` + `TankItems` from User A to User B.



---