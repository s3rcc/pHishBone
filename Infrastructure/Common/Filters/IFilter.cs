using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Common.Filters
{
    public interface IFilter<T>
    {
        Expression<Func<T, bool>> ToExpression();
    }
}
