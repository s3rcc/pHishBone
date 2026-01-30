---
name: dotnet-backend-patterns
description: Guidelines and patterns for the pHishbone backend (C#/.NET 8, Supabase, EF Core, Unit of Work, Serilog).
---

# Backend Development Guidelines (pHishbone)

**Tech Stack**: .NET 8, PostgreSQL (Supabase), EF Core, Serilog, AutoMapper, FluentValidation, Redis.

You are a senior backend engineer operating production-grade services. These guidelines define how coding must be done in this project.

## 1. Backend Feasibility & Risk Index (BFRI)

Before implementing or modifying a backend feature, assess feasibility using this index.

**BFRI Dimensions (1–5)**
| Dimension | Question |
| :--- | :--- |
| **Architectural Fit** | Does this follow `Controller` → `Service` → `UnitOfWork` → `Repository` flow? |
| **Business Logic Complexity** | How complex is the domain logic? |
| **Data Risk** | Does this affect critical data paths or transactions? |
| **Operational Risk** | Does this impact auth (Supabase), critical infra, or performance? |
| **Testability** | Can this be reliably unit + integration tested? |

**Score Formula**
`BFRI = (Architectural Fit + Testability) − (Complexity + Data Risk + Operational Risk)`
*Range: -10 → +10*

**Interpretation**
| BFRI | Meaning | Action |
| :--- | :--- | :--- |
| **6–10** | Safe | Proceed |
| **3–5** | Moderate | Add tests + detailed logging (Serilog) |
| **0–2** | Risky | Refactor before implementation. Discuss with team. |
| **< 0** | Dangerous | Redesign immediately. Do not code. |

---

## 2. Project Architecture (Clean Architecture)

The solution follows a strict Layered Architecture:

```
src/
├── Domain/                     # Enterprise Logic (Entities, Enums, Exceptions)
│   ├── Entities/               # BaseEntity, Business Entities
│   ├── Enums/
│   └── Exceptions/             # CustomErrorException
├── Application/                # key Business Rules (Interfaces, DTOs, Mapping, Validation)
│   ├── Common/Interfaces/      # IUnitOfWork, ICurrentUserService
│   ├── DTOs/                   # Data Transfer Objects
│   ├── Services/               # Service Interfaces (ITagService)
│   ├── Validators/             # FluentValidation rules
│   └── Constants/              # Error messages, configuration keys
├── Infrastructure/             # External Concerns (Db, Eth, Auth)
│   ├── Persistence/            # EF Core DbContext, Repositories
│   ├── Services/               # Service Implementations (TagService)
│   └── DependencyInjection.cs  # Service registration
└── pHishbone/                  # API Entry Point
    ├── Controllers/            # Thin controllers
    ├── Middleware/             # ExceptionHandlingMiddleware
    └── Extensions/             # ServiceExtensions
```

---

## 3. Key Patterns & Conventions

### 3.1 Unit of Work & Generic Repository
We do **not** inject `DbContext` directly into Services. Use `IUnitOfWork`.

```csharp
// ✅ CORRECT: Service Accessing Data
public class TagService : ITagService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TagService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TagDto> GetByIdAsync(string id)
    {
        // Use Repository<T>() to access Generic Repository
        var tag = await _unitOfWork.Repository<Tag>()
            .SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                tracking: false // Use false for read-only
            );

        if (tag == null)
            throw new CustomErrorException(StatusCodes.Status404NotFound, ErrorCode.NOT_FOUND, "Tag not found");

        return _mapper.Map<TagDto>(tag);
    }
    
    public async Task CreateAsync(CreateTagDto dto)
    {
        var tag = _mapper.Map<Tag>(dto);
        await _unitOfWork.Repository<Tag>().InsertAsync(tag);
        
        // Commit transaction at the end of the business unit
        await _unitOfWork.SaveChangesAsync();
    }
}
```

### 3.2 Error Handling (Custom Exceptions)
Use `CustomErrorException` for flow control when business rules fail. Do **not** return generic 500s.
The `ExceptionHandlingMiddleware` will catch these and format a consistent JSON response.

```csharp
// ✅ CORRECT: Throwing typical business error
if (existingItem != null)
{
    throw new CustomErrorException(
        StatusCodes.Status400BadRequest,
        ErrorCode.DUPLICATE,
        CatalogErrorMessageConstant.DuplicateName
    );
}

// ❌ WRONG: Returning null or bool for failure
if (existingItem != null) return null; 
```

### 3.3 Validation (FluentValidation)
Validators reside in `Application/Validators`. They are auto-wired in `ServiceExtensions`.

```csharp
using Application.Constants;

public class CreateTagDtoValidator : AbstractValidator<CreateTagDto>
{
    public CreateTagDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(ValidationMessageConstant.NameRequired)
            .MaximumLength(100);
            
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage(ValidationMessageConstant.CodeRequired)
            .Matches("^[A-Z0-9]+$").WithMessage(ValidationMessageConstant.CodeFormat);
    }
}
```

### 3.4 Dependency Injection
- **Infrastructure**: Registered in `Infrastructure/DependencyInjection.cs` (Db, Repos, Auth).
- **Application**: Registered in `pHishbone/Extensions/ServiceExtensions.cs` (Mapper, Validators).
- **Core Rules**:
    - Use `Scoped` for Services and Repositories.
    - Use `Singleton` for Cache and Configuration.

```csharp
// Infrastructure/DependencyInjection.cs
services.AddScoped<IUnitOfWork, UnitOfWork>();
services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
services.AddScoped<ITagService, TagService>(); // Interface -> Implementation
```

### 3.5 Caching (Redis)
Use `IDistributedCache` for performance. Wraps commonly accessed data.

```csharp
public async Task<TagDto> GetCachedTagAsync(string id)
{
    string key = $"tag:{id}";
    var cached = await _cache.GetStringAsync(key);
    if (cached != null)
    {
        return JsonSerializer.Deserialize<TagDto>(cached);
    }

    var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(t => t.Id == id);
    if (tag != null)
    {
        await _cache.SetStringAsync(key, JsonSerializer.Serialize(tag), new DistributedCacheEntryOptions 
        { 
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) 
        });
    }
    return _mapper.Map<TagDto>(tag);
}
```

### 3.6 Logging (Serilog)
Use Serilog for all logging. `Log.Logger` or `ILogger<T>` injection.
Ensure structured logging (use placeholders `{TagId}`, not string interpolation).

```csharp
_logger.LogInformation("Creating new tag with Code: {Code}", dto.Code);
```

### 3.7 Constants
Never hardcode strings. Use `Application/Constants` classes.

```csharp
// Application/Constants/CatalogErrorMessageConstant.cs
public static class CatalogErrorMessageConstant
{
    public const string TagNotFoundMessage = "Tag with the given ID was not found.";
    public const string TagNameDuplicate = "Tag name already exists.";
}
```

## 4. Entity & Database Rules

Strict rules for managing database entities and migrations:
1.  **Inheritance**: All entities MUST inherit from `BaseEntity` (provides Id, CreatedAt, etc.).
2.  **Migrations**: 
    *   **Do NOT** manually edit migration files.
    *   **Do NOT** run `dotnet ef migrations` commands (add, remove, update) unless explicitly instructed.
    *   Schema changes are sensitive; rely on reviewed procedures.
3.  **Table Configuration**: Use `IEntityTypeConfiguration<T>` in `Infrastructure/Persistence/Configurations` to configure table constraints, not Data Annotations.

---

## 5. Senior Developer Mindset Checklist

Before marking a task complete:
1.  **Observability**: Did you log the "Why" and "What" using structured Serilog?
2.  **Configuration**: Are connection strings and secrets in `appsettings` (and properly overridden in env vars)?
3.  **Performance**: Are generic repository calls using `AsNoTracking()` (via `tracking: false` param) for reads?
4.  **Security**: Is the controller/endpoint protected with `[Authorize]` if needed?
5.  **Clean Code**: Are magic strings moved to Constants? Is logic in Service, not Controller?

---

## 6. Best Practices & Common Pitfalls

### DO
1.  **Use async/await** all the way through the call stack (Controllers → Services → Repositories).
2.  **Inject dependencies** through constructor injection (no `new Service()`).
3.  **Use IOptions<T>** for typed configuration settings.
4.  **Use Custom Exceptions** (`CustomErrorException`) for business logic failures, NOT generic 500s or Result objects.
5.  **Use CancellationToken** in all async methods to allow request cancellation.
6.  **Use Generic Repository/Unit of Work** for consistent data access.
7.  **Cache aggressively** but use proper invalidation (Redis).
8.  **Write unit tests** (xUnit + Moq) for complex business logic.
9.  **Use record types** for DTOs to ensure immutability.
10. **Use Constants** for all magic strings (Errors, Validation messages).

### DON'T
1.  **Don't block on async** with `.Result` or `.Wait()`.
2.  **Don't use async void** (except event handlers).
3.  **Don't catch generic Exception** in business logic (let Middleware handle it).
4.  **Don't hardcode** configuration values or error messages.
5.  **Don't expose EF Entities** in APIs (Always map to DTOs).
6.  **Don't forget** `tracking: false` for read-only queries (performance).
7.  **Don't ignore** `CancellationToken` parameters.
8.  **Don't create** `HttpClient` manually (use `IHttpClientFactory`).
9.  **Don't perform database logic** in Controllers.
10. **Don't ignore validation** errors; handle them gracefully.

### Common Pitfalls
-   **N+1 Queries**: Use `.Include()` (in Repo) to eagerly load related data when needed.
-   **Memory Leaks**: Always use `using` or scoped services for IDisposable resources.
-   **Over-fetching**: Select only needed fields (or use specific DTOs).
-   **Missing Indexes**: Ensure commonly queried columns (e.g., `Code`, `Slug`) are indexed in Entity Configuration.
-   **Timeout Issues**: Configure appropriate timeouts for external calls.
-   **Duplicate Data**: Check for duplicates (e.g., `Code` or `Email`) *before* inserting.
