using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using AutoMapper;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using CatalogType = Domain.Entities.Catalog.Type;

namespace Infrastructure.Services
{
    public class TypeService : ITypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TypeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<TypeDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var type = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TypeNotFoundMessage
                );
            }

            return _mapper.Map<TypeDto>(type);
        }

        public async Task<ICollection<TypeDto>> GetListAsync(CancellationToken cancellationToken = default)
        {
            var types = await _unitOfWork.Repository<CatalogType>().GetListAsync(
                orderBy: q => q.OrderBy(t => t.Name),
                cancellationToken: cancellationToken
            );

            return _mapper.Map<ICollection<TypeDto>>(types);
        }

        public async Task<PaginationResponse<TypeDto>> GetPaginatedListAsync(TypeFilterDto filter, CancellationToken cancellationToken = default)
        {
            var types = await _unitOfWork.Repository<CatalogType>().GetPagingListAsync(
                predicate: string.IsNullOrWhiteSpace(filter.SearchTerm) ? null :
                    t => t.Name.Contains(filter.SearchTerm),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending,
                cancellationToken: cancellationToken
            );

            return new PaginationResponse<TypeDto>
            {
                Size = types.Size,
                Page = types.Page,
                Total = types.Total,
                TotalPages = types.TotalPages,
                Items = _mapper.Map<IList<TypeDto>>(types.Items)
            };
        }

        public async Task<TypeDto> CreateAsync(CreateTypeDto dto, CancellationToken cancellationToken = default)
        {
            // Check for duplicate name
            var existingWithName = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TypeNameDuplicate
                );
            }

            var type = _mapper.Map<CatalogType>(dto);
            await _unitOfWork.Repository<CatalogType>().InsertAsync(type, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<TypeDto>(type);
        }

        public async Task<ICollection<TypeDto>> CreateRangeAsync(List<CreateTypeDto> dtos, CancellationToken cancellationToken = default)
        {
            // Check for duplicate names in batch
            var names = dtos.Select(d => d.Name).ToList();
            var existingNames = await _unitOfWork.Repository<CatalogType>().GetListAsync(
                predicate: t => names.Contains(t.Name) && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (existingNames.Any())
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    $"Types with names already exist: {string.Join(", ", existingNames.Select(t => t.Name))}"
                );
            }

            var types = _mapper.Map<List<CatalogType>>(dtos);
            await _unitOfWork.Repository<CatalogType>().InsertRangeAsync(types, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<ICollection<TypeDto>>(types);
        }

        public async Task<TypeDto> UpdateAsync(string id, UpdateTypeDto dto, CancellationToken cancellationToken = default)
        {
            var type = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TypeNotFoundMessage
                );
            }

            // Check for duplicate name (excluding current type)
            var existingWithName = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.Id != id && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TypeNameDuplicate
                );
            }

            _mapper.Map(dto, type);
            await _unitOfWork.Repository<CatalogType>().Update(type);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<TypeDto>(type);
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
        {
            var type = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TypeNotFoundMessage
                );
            }

            _unitOfWork.Repository<CatalogType>().Delete(type);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
