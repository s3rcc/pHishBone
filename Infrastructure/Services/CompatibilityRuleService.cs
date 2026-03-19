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
    public class CompatibilityRuleService : ICompatibilityRuleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CompatibilityRuleService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CompatibilityRuleDto> GetByIdAsync(string id)
        {
            var rule = await _unitOfWork.Repository<CompatibilityRule>().SingleOrDefaultAsync(
                predicate: r => r.Id == id,
                include: q => q.Include(r => r.SubjectTag).Include(r => r.ObjectTag),
                tracking: false
            );

            if (rule == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.RuleNotFound
                );
            }

            return _mapper.Map<CompatibilityRuleDto>(rule);
        }

        public async Task<PaginationResponse<CompatibilityRuleDto>> GetPaginatedListAsync(CompatibilityRuleFilterDto filter)
        {
            var rules = await _unitOfWork.Repository<CompatibilityRule>().GetPagingListAsync(
                predicate: string.IsNullOrWhiteSpace(filter.SearchTerm) ? null :
                    r => r.SubjectTag.Name.Contains(filter.SearchTerm) ||
                         r.ObjectTag.Name.Contains(filter.SearchTerm) ||
                         r.Message.Contains(filter.SearchTerm),
                include: q => q.Include(r => r.SubjectTag).Include(r => r.ObjectTag),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending
            );

            return new PaginationResponse<CompatibilityRuleDto>
            {
                Size = rules.Size,
                Page = rules.Page,
                Total = rules.Total,
                TotalPages = rules.TotalPages,
                Items = _mapper.Map<IList<CompatibilityRuleDto>>(rules.Items)
            };
        }

        public async Task<CompatibilityRuleDto> CreateAsync(CreateCompatibilityRuleDto dto)
        {
            // 1. Self-reference check
            if (dto.SubjectTagId == dto.ObjectTagId)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.RuleSelfReference
                );
            }

            // 2. Tag existence checks
            var subjectTag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == dto.SubjectTagId,
                tracking: false
            );
            if (subjectTag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.RuleSubjectTagNotFound
                );
            }

            var objectTag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == dto.ObjectTagId,
                tracking: false
            );
            if (objectTag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.RuleObjectTagNotFound
                );
            }

            // 3. Bidirectional duplicate check (A→B or B→A)
            var existingRule = await _unitOfWork.Repository<CompatibilityRule>().SingleOrDefaultAsync(
                predicate: r =>
                    (r.SubjectTagId == dto.SubjectTagId && r.ObjectTagId == dto.ObjectTagId) ||
                    (r.SubjectTagId == dto.ObjectTagId && r.ObjectTagId == dto.SubjectTagId),
                tracking: false
            );
            if (existingRule != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.RuleDuplicate
                );
            }

            // 4. Create the rule
            var rule = _mapper.Map<CompatibilityRule>(dto);
            await _unitOfWork.Repository<CompatibilityRule>().InsertAsync(rule);
            await _unitOfWork.SaveChangesAsync();

            // Re-fetch with includes to populate tag names for the response
            var created = await _unitOfWork.Repository<CompatibilityRule>().SingleOrDefaultAsync(
                predicate: r => r.Id == rule.Id,
                include: q => q.Include(r => r.SubjectTag).Include(r => r.ObjectTag),
                tracking: false
            );

            return _mapper.Map<CompatibilityRuleDto>(created!);
        }

        public async Task<CompatibilityRuleDto> UpdateAsync(string id, UpdateCompatibilityRuleDto dto)
        {
            var rule = await _unitOfWork.Repository<CompatibilityRule>().SingleOrDefaultAsync(
                predicate: r => r.Id == id,
                include: q => q.Include(r => r.SubjectTag).Include(r => r.ObjectTag)
            );

            if (rule == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.RuleNotFound
                );
            }

            // Only update Severity and Message — tags are immutable
            rule.Severity = dto.Severity;
            rule.Message = dto.Message;

            await _unitOfWork.Repository<CompatibilityRule>().Update(rule);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<CompatibilityRuleDto>(rule);
        }

        public async Task DeleteAsync(string id)
        {
            var rule = await _unitOfWork.Repository<CompatibilityRule>().SingleOrDefaultAsync(
                predicate: r => r.Id == id
            );

            if (rule == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.RuleNotFound
                );
            }

            _unitOfWork.Repository<CompatibilityRule>().Delete(rule);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
