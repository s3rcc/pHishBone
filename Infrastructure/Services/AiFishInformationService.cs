using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.AiDTOs;
using Application.DTOs.CatalogDTOs;
using AutoMapper;
using Domain.Entities.Ai;
using Domain.Entities.Catalog;
using Domain.Enums;
using Domain.Exceptions;
using FluentValidation;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace Infrastructure.Services
{
    public class AiFishInformationService : IAiFishInformationService
    {
        //private const string ExistingCatalogSource = "ExistingCatalog";
        //private const string AiGeneratedSource = "AiGenerated";

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<AiFishInformationService> _logger;
        private readonly IEnumerable<IAiProviderClient> _providerClients;

        public AiFishInformationService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<AiFishInformationService> logger,
            IEnumerable<IAiProviderClient> providerClients)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _providerClients = providerClients;
        }

        public async Task<AiFishInformationResponseDto> GenerateFishInformationAsync(GenerateFishInformationRequestDto dto, CancellationToken cancellationToken = default)
        {
            var totalStopwatch = Stopwatch.StartNew();
            var normalizedFishName = NormalizeFishName(dto.FishName);
            _logger.LogInformation("Generating fish information for fish name {FishName} using model config {ModelConfigId}", normalizedFishName, dto.ModelConfigId);

            var existingSpeciesStopwatch = Stopwatch.StartNew();
            var existingSpecies = await TryGetExistingSpeciesAsync(normalizedFishName);
            existingSpeciesStopwatch.Stop();
            _logger.LogInformation("Fish information stage ExistingSpeciesCheck completed in {ElapsedMs} ms", existingSpeciesStopwatch.ElapsedMilliseconds);
            if (existingSpecies != null)
            {
                totalStopwatch.Stop();
                _logger.LogInformation("Fish information request resolved from existing catalog in {ElapsedMs} ms", totalStopwatch.ElapsedMilliseconds);
                return new AiFishInformationResponseDto
                {
                    ModelConfigId = dto.ModelConfigId,
                    ExistingSpecies = _mapper.Map<SpeciesDetailDto>(existingSpecies)
                };
            }

            var dependencyLoadStopwatch = Stopwatch.StartNew();
            var modelConfig = await GetEnabledModelAsync(dto.ModelConfigId);
            var promptTemplate = await GetActivePromptAsync(AiPromptUseCase.FishInformation);
            var vocabulary = await LoadVocabularyAsync();
            dependencyLoadStopwatch.Stop();
            _logger.LogInformation("Fish information stage DependencyLoad completed in {ElapsedMs} ms", dependencyLoadStopwatch.ElapsedMilliseconds);

            var providerClient = ResolveProviderClient(modelConfig.Provider);

            var systemPrompt = BuildSystemPrompt(promptTemplate.SystemPrompt, vocabulary);
            var userPrompt = BuildUserPrompt(normalizedFishName);
            var effectiveMaxOutputTokens = modelConfig.MaxOutputTokens;
            _logger.LogInformation(
                "Fish information AI request prepared for provider {Provider} model {ModelId}. MaxOutputTokens={MaxOutputTokens}, Temperature={Temperature}, TimeoutSeconds={TimeoutSeconds}, SystemPromptLength={SystemPromptLength}, UserPromptLength={UserPromptLength}",
                modelConfig.Provider,
                modelConfig.ProviderModelId,
                effectiveMaxOutputTokens,
                modelConfig.Temperature,
                modelConfig.TimeoutSeconds,
                systemPrompt.Length,
                userPrompt.Length);

            var aiCallStopwatch = Stopwatch.StartNew();
            var aiResponse = await providerClient.GenerateStructuredOutputAsync<AiFishInformationStructuredResponse>(
                modelConfig.ProviderModelId,
                systemPrompt,
                userPrompt,
                effectiveMaxOutputTokens,
                modelConfig.Temperature,
                modelConfig.TimeoutSeconds,
                cancellationToken);
            aiCallStopwatch.Stop();
            _logger.LogInformation("Fish information stage AiProviderCall completed in {ElapsedMs} ms", aiCallStopwatch.ElapsedMilliseconds);

            EnsureAiResponseNotEmpty(aiResponse);

            //var postProcessingStopwatch = Stopwatch.StartNew();
            var issues = new List<AiGenerationIssueDto>();
            var generatedDraft = BuildDraft(aiResponse, vocabulary, issues);

            //postProcessingStopwatch.Stop();
            //_logger.LogInformation("Fish information stage DraftMapping completed in {ElapsedMs} ms with {IssueCount} issues", postProcessingStopwatch.ElapsedMilliseconds, issues.Count);

            totalStopwatch.Stop();
            _logger.LogInformation("Fish information request completed in {ElapsedMs} ms", totalStopwatch.ElapsedMilliseconds);

            return new AiFishInformationResponseDto
            {
                ModelConfigId = modelConfig.Id,
                PromptTemplateId = promptTemplate.Id,
                GeneratedDraft = generatedDraft
            };
        }

        private async Task<Species?> TryGetExistingSpeciesAsync(string normalizedFishName)
        {
            var lowerName = normalizedFishName.ToLowerInvariant();
            return await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.DeletedTime == null &&
                    (s.CommonName.ToLower() == lowerName || s.ScientificName.ToLower() == lowerName),
                include: q => q
                    .Include(s => s.Type)
                    .Include(s => s.SpeciesEnvironment)
                    .Include(s => s.SpeciesProfile)
                    .Include(s => s.SpeciesTags)
                        .ThenInclude(st => st.Tag)
            );
        }

        private async Task<AiModelConfig> GetEnabledModelAsync(string modelConfigId)
        {
            var modelConfig = await _unitOfWork.Repository<AiModelConfig>().SingleOrDefaultAsync(
                predicate: x => x.Id == modelConfigId && x.DeletedTime == null
            );

            if (modelConfig == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    AiErrorMessageConstant.AiModelNotFound
                );
            }

            if (!modelConfig.IsEnabled)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    AiErrorMessageConstant.AiModelDisabled
                );
            }

            return modelConfig;
        }

        private async Task<AiPromptTemplate> GetActivePromptAsync(AiPromptUseCase useCase)
        {
            var prompt = await _unitOfWork.Repository<AiPromptTemplate>().SingleOrDefaultAsync(
                predicate: x => x.DeletedTime == null && x.UseCase == useCase && x.IsEnabled && x.IsActive
            );

            if (prompt == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    AiErrorMessageConstant.AiPromptActiveMissing
                );
            }

            return prompt;
        }

        private IAiProviderClient ResolveProviderClient(AiProvider provider)
        {
            var client = _providerClients.FirstOrDefault(x => x.Provider == provider);
            if (client == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    AiErrorMessageConstant.AiProviderUnsupported
                );
            }

            return client;
        }

        private async Task<AiVocabulary> LoadVocabularyAsync()
        {
            var types = await _unitOfWork.Repository<Domain.Entities.Catalog.Type>().GetListAsync(
                predicate: x => x.DeletedTime == null,
                orderBy: q => q.OrderBy(x => x.Name)
            );

            var tags = await _unitOfWork.Repository<Tag>().GetListAsync(
                predicate: x => x.DeletedTime == null,
                orderBy: q => q.OrderBy(x => x.Code)
            );

            return new AiVocabulary(types, tags);
        }

        private static string BuildSystemPrompt(string template, AiVocabulary vocabulary)
        {
            var typeNames = string.Join(", ", vocabulary.Types.Select(x => x.Name));
            var tagCodes = string.Join(", ", vocabulary.Tags.Select(x => x.Code));
            var waterTypes = string.Join(", ", Enum.GetNames<WaterType>());
            var swimLevels = string.Join(", ", Enum.GetNames<SwimLevel>());
            var dietTypes = string.Join(", ", Enum.GetNames<DietType>());

            return $"""
{template}

Return only valid JSON.
Never invent internal database IDs.
Use only these semantic values when applicable.
Type names: {typeNames}
Tag codes: {tagCodes}
WaterType values: {waterTypes}
SwimLevel values: {swimLevels}
DietType values: {dietTypes}
Keep every text field concise.
""";
        }

        private static string BuildUserPrompt(string fishName)
        {
            return $"""
Generate aquarium fish information for "{fishName}".
Return only the JSON object with all required fields filled.
Use enum names, not numbers.
""";
        }

        private static void EnsureAiResponseNotEmpty(AiFishInformationStructuredResponse response)
        {
            if (response == null || string.IsNullOrWhiteSpace(response.CommonName) || string.IsNullOrWhiteSpace(response.ScientificName))
            {
                throw new CustomErrorException(
                    StatusCodes.Status502BadGateway,
                    ErrorCode.FAILED,
                    AiErrorMessageConstant.AiResponseEmpty
                );
            }
        }

        private static AiGeneratedSpeciesDraftDto BuildDraft(
            AiFishInformationStructuredResponse aiResponse,
            AiVocabulary vocabulary,
            List<AiGenerationIssueDto> issues)
        {
            var draft = new AiGeneratedSpeciesDraftDto
            {
                CommonName = (aiResponse.CommonName ?? string.Empty).Trim(),
                ScientificName = (aiResponse.ScientificName ?? string.Empty).Trim(),
                TypeName = (aiResponse.TypeName ?? string.Empty).Trim(),
                ThumbnailUrl = null,
                TagCodes = aiResponse.TagCodes?
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Select(x => x.Trim().ToUpperInvariant())
                    .Distinct()
                    .ToList() ?? new List<string>(),
                Environment = new AiGeneratedSpeciesDraftDto.EnvironmentDraftDto
                {
                    PhMin = aiResponse.Environment?.PhMin ?? 0,
                    PhMax = aiResponse.Environment?.PhMax ?? 0,
                    TempMin = aiResponse.Environment?.TempMin ?? 0,
                    TempMax = aiResponse.Environment?.TempMax ?? 0,
                    MinTankVolume = aiResponse.Environment?.MinTankVolume ?? 0,
                    WaterTypeName = aiResponse.Environment?.WaterType?.Trim() ?? string.Empty
                },
                Profile = new AiGeneratedSpeciesDraftDto.ProfileDraftDto
                {
                    AdultSize = aiResponse.Profile?.AdultSize ?? 0,
                    BioLoadFactor = aiResponse.Profile?.BioLoadFactor ?? 0,
                    SwimLevelName = aiResponse.Profile?.SwimLevel?.Trim() ?? string.Empty,
                    DietTypeName = aiResponse.Profile?.DietType?.Trim() ?? string.Empty,
                    PreferredFood = string.IsNullOrWhiteSpace(aiResponse.Profile?.PreferredFood) ? null : aiResponse.Profile.PreferredFood.Trim(),
                    IsSchooling = aiResponse.Profile?.IsSchooling ?? false,
                    MinGroupSize = aiResponse.Profile?.MinGroupSize ?? 0,
                    Origin = string.IsNullOrWhiteSpace(aiResponse.Profile?.Origin) ? null : aiResponse.Profile.Origin.Trim(),
                    Description = string.IsNullOrWhiteSpace(aiResponse.Profile?.Description) ? null : aiResponse.Profile.Description.Trim()
                }
            };

            var matchedType = vocabulary.Types.FirstOrDefault(x => string.Equals(x.Name, draft.TypeName, StringComparison.OrdinalIgnoreCase));
            if (matchedType == null)
            {
                issues.Add(CreateIssue("typeName", "TYPE_NOT_MAPPED", $"No catalog type matched '{draft.TypeName}'.", draft.TypeName));
            }
            else
            {
                draft.TypeId = matchedType.Id;
                draft.TypeName = matchedType.Name;
            }

            foreach (var tagCode in draft.TagCodes)
            {
                var matchedTag = vocabulary.Tags.FirstOrDefault(x => string.Equals(x.Code, tagCode, StringComparison.OrdinalIgnoreCase));
                if (matchedTag == null)
                {
                    issues.Add(CreateIssue("tagCodes", "TAG_NOT_MAPPED", $"No catalog tag matched '{tagCode}'.", tagCode));
                    continue;
                }

                draft.TagIds.Add(matchedTag.Id);
            }

            if (!TryParseEnumName(draft.Environment.WaterTypeName, out WaterType waterType))
            {
                issues.Add(CreateIssue("environment.waterType", "ENUM_NOT_MAPPED", $"WaterType '{draft.Environment.WaterTypeName}' is not valid.", draft.Environment.WaterTypeName));
            }
            else
            {
                draft.Environment.WaterType = (int)waterType;
                draft.Environment.WaterTypeName = waterType.ToString();
            }

            if (!TryParseEnumName(draft.Profile.SwimLevelName, out SwimLevel swimLevel))
            {
                issues.Add(CreateIssue("profile.swimLevel", "ENUM_NOT_MAPPED", $"SwimLevel '{draft.Profile.SwimLevelName}' is not valid.", draft.Profile.SwimLevelName));
            }
            else
            {
                draft.Profile.SwimLevel = (int)swimLevel;
                draft.Profile.SwimLevelName = swimLevel.ToString();
            }

            if (!TryParseEnumName(draft.Profile.DietTypeName, out DietType dietType))
            {
                issues.Add(CreateIssue("profile.dietType", "ENUM_NOT_MAPPED", $"DietType '{draft.Profile.DietTypeName}' is not valid.", draft.Profile.DietTypeName));
            }
            else
            {
                draft.Profile.DietType = (int)dietType;
                draft.Profile.DietTypeName = dietType.ToString();
            }

            return draft;
        }

        private static AiGenerationIssueDto CreateIssue(string field, string code, string message, string? attemptedValue)
        {
            return new AiGenerationIssueDto
            {
                Field = field,
                Code = code,
                Message = message,
                AttemptedValue = attemptedValue
            };
        }

        private static bool TryParseEnumName<TEnum>(string value, out TEnum enumValue)
            where TEnum : struct, Enum
        {
            return Enum.TryParse(value, true, out enumValue);
        }

        private static string NormalizeFishName(string fishName)
        {
            return Regex.Replace(fishName.Trim(), @"\s+", " ");
        }

        private sealed class AiVocabulary
        {
            public AiVocabulary(ICollection<Domain.Entities.Catalog.Type> types, ICollection<Tag> tags)
            {
                Types = types;
                Tags = tags;
            }

            public ICollection<Domain.Entities.Catalog.Type> Types { get; }
            public ICollection<Tag> Tags { get; }
        }

        private sealed class AiFishInformationStructuredResponse
        {
            public string? CommonName { get; set; }
            public string? ScientificName { get; set; }
            public string? TypeName { get; set; }
            public List<string>? TagCodes { get; set; }
            public AiFishEnvironmentStructuredResponse? Environment { get; set; }
            public AiFishProfileStructuredResponse? Profile { get; set; }
        }

        private sealed class AiFishEnvironmentStructuredResponse
        {
            public decimal PhMin { get; set; }
            public decimal PhMax { get; set; }
            public int TempMin { get; set; }
            public int TempMax { get; set; }
            public int MinTankVolume { get; set; }
            public string? WaterType { get; set; }
        }

        private sealed class AiFishProfileStructuredResponse
        {
            public decimal AdultSize { get; set; }
            public decimal BioLoadFactor { get; set; }
            public string? SwimLevel { get; set; }
            public string? DietType { get; set; }
            public string? PreferredFood { get; set; }
            public bool IsSchooling { get; set; }
            public int MinGroupSize { get; set; }
            public string? Origin { get; set; }
            public string? Description { get; set; }
        }
    }
}
