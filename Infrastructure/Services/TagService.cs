using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using AutoMapper;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
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
            var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == id
            );

            if (tag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TagNotFoundMessage
                );
            }

            return _mapper.Map<TagDto>(tag);
        }

        public async Task<ICollection<TagDto>> GetListAsync()
        {
            var tags = await _unitOfWork.Repository<Tag>().GetListAsync(
                orderBy: q => q.OrderBy(t => t.Name)
            );

            return _mapper.Map<ICollection<TagDto>>(tags);
        }

        public async Task<PaginationResponse<TagDto>> GetPaginatedListAsync(TagFilterDto filter)
        {
            var tags = await _unitOfWork.Repository<Tag>().GetPagingListAsync(
                predicate: string.IsNullOrWhiteSpace(filter.SearchTerm) ? null :
                    t => t.Code.Contains(filter.SearchTerm) || t.Name.Contains(filter.SearchTerm),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending
            );

            return new PaginationResponse<TagDto>
            {
                Size = tags.Size,
                Page = tags.Page,
                Total = tags.Total,
                TotalPages = tags.TotalPages,
                Items = _mapper.Map<IList<TagDto>>(tags.Items)
            };
        }

        // ─── Code Normalizer ──────────────────────────────────────────────
        /// <summary>
        /// Normalises a raw tag code input into SCREAMING_SNAKE_CASE.
        /// "high light" → "HIGH_LIGHT", "easy-care!" → "EASY_CARE"
        /// Rules:
        ///   1. Trim surrounding whitespace.
        ///   2. Replace any run of non-alphanumeric-ASCII characters with '_'.
        ///   3. Uppercase.
        ///   4. Strip leading / trailing underscores.
        ///   5. Collapse consecutive underscores into one.
        /// Throws if the result is empty or does not match ^[A-Z][A-Z0-9_]*$.
        /// </summary>
        private static string NormalizeCode(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.TagCodeRequired);

            // Replace any char that is not A-Z / a-z / 0-9 with '_'
            var replaced = System.Text.RegularExpressions.Regex.Replace(raw.Trim(), @"[^A-Za-z0-9]+", "_");

            // Uppercase, strip leading/trailing underscores, collapse doubles
            var normalized = System.Text.RegularExpressions.Regex.Replace(
                replaced.Trim('_').ToUpperInvariant(), @"_+", "_");

            if (string.IsNullOrEmpty(normalized))
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.TagCodeInvalidFormat);

            // Ensure it starts with a letter
            if (!char.IsLetter(normalized[0]))
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.TagCodeMustStartWithLetter);

            return normalized;
        }

        public async Task<TagDto> CreateAsync(CreateTagDto dto)
        {
            // Normalize code before any validation or persistence
            dto.Code = NormalizeCode(dto.Code);

            // Check for duplicate code
            var existingWithCode = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Code == dto.Code
            );
            if (existingWithCode != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagCodeDuplicate
                );
            }

            // Check for duplicate name
            var existingWithName = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagNameDuplicate
                );
            }

            var tag = _mapper.Map<Tag>(dto);
            await _unitOfWork.Repository<Tag>().InsertAsync(tag);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TagDto>(tag);
        }

        public async Task<ICollection<TagDto>> CreateRangeAsync(List<CreateTagDto> dtos)
        {
            // Normalize all codes first
            foreach (var dto in dtos)
                dto.Code = NormalizeCode(dto.Code);

            // Check for duplicate codes in batch
            var codes = dtos.Select(d => d.Code).ToList();
            var existingCodes = await _unitOfWork.Repository<Tag>().GetListAsync(
                predicate: t => codes.Contains(t.Code)
            );

            if (existingCodes.Any())
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    $"Tags with codes already exist: {string.Join(", ", existingCodes.Select(t => t.Code))}"
                );
            }

            // Check for duplicate names in batch
            var names = dtos.Select(d => d.Name).ToList();
            var existingNames = await _unitOfWork.Repository<Tag>().GetListAsync(
                predicate: t => names.Contains(t.Name)
            );

            if (existingNames.Any())
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    $"Tags with names already exist: {string.Join(", ", existingNames.Select(t => t.Name))}"
                );
            }

            var tags = _mapper.Map<List<Tag>>(dtos);
            await _unitOfWork.Repository<Tag>().InsertRangeAsync(tags);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ICollection<TagDto>>(tags);
        }

        public async Task<TagDto> UpdateAsync(string id, UpdateTagDto dto)
        {
            // Normalize code before any checks
            dto.Code = NormalizeCode(dto.Code);

            var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == id
            );

            if (tag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TagNotFoundMessage
                );
            }

            // Check for duplicate code (excluding current tag)
            var existingWithCode = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Code == dto.Code && t.Id != id
            );
            if (existingWithCode != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagCodeDuplicate
                );
            }

            // Check for duplicate name (excluding current tag)
            var existingWithName = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.Id != id
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagNameDuplicate
                );
            }

            _mapper.Map(dto, tag);
            await _unitOfWork.Repository<Tag>().Update(tag);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TagDto>(tag);
        }

        public async Task DeleteAsync(string id)
        {
            var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == id
            );

            if (tag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TagNotFoundMessage
                );
            }

            _unitOfWork.Repository<Tag>().Delete(tag);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
