package gen.codbex_uoms.api.settings;

import gen.codbex_uoms.data.settings.UoMEntity;
import gen.codbex_uoms.data.settings.UoMRepository;

import org.eclipse.dirigible.components.api.security.UserFacade;
import org.eclipse.dirigible.engine.java.annotations.Documentation;
import org.eclipse.dirigible.engine.java.annotations.Inject;
import org.eclipse.dirigible.engine.java.annotations.http.Body;
import org.eclipse.dirigible.engine.java.annotations.http.Controller;
import org.eclipse.dirigible.engine.java.annotations.http.Delete;
import org.eclipse.dirigible.engine.java.annotations.http.Get;
import org.eclipse.dirigible.engine.java.annotations.http.PathParam;
import org.eclipse.dirigible.engine.java.annotations.http.Post;
import org.eclipse.dirigible.engine.java.annotations.http.Put;
import org.eclipse.dirigible.engine.java.annotations.http.QueryParam;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Controller
@Documentation("codbex-uoms - UoM Controller")
public class UoMController {

    private static final Set<String> FILTER_FIELDS = Set.of("Id", "Name", "ISO", "Dimension", "SAP", "Numerator", "Denominator", "Rounding", "Base");

    @Inject
    private UoMRepository repository;

    @Get
    @Documentation("List UoM")
    public List<UoMEntity> getAll(@QueryParam("$limit") Integer limit,
                                      @QueryParam("$offset") Integer offset) {
        checkPermissions("read");
        int actualLimit = limit != null ? limit.intValue() : 20;
        int actualOffset = offset != null ? offset.intValue() : 0;
        List<UoMEntity> result = repository.findAll(actualLimit, actualOffset);
        return result;
    }

    @Get("/count")
    @Documentation("Count UoM")
    public Map<String, Long> count() {
        checkPermissions("read");
        return Map.of("count", repository.count());
    }

    @Post("/count")
    @Documentation("Count UoM with filter")
    public Map<String, Long> countWithFilter(@Body Map<String, Object> filter) {
        checkPermissions("read");
        return Map.of("count", (long) runFilter(filter).size());
    }

    @Post("/search")
    @Documentation("Search UoM")
    public List<UoMEntity> search(@Body Map<String, Object> filter) {
        checkPermissions("read");
        List<UoMEntity> result = runFilter(filter);
        return result;
    }

    @Get("/{id}")
    @Documentation("Get UoM by id")
    public UoMEntity getById(@PathParam("id") Integer id) {
        checkPermissions("read");
        UoMEntity entity = repository.findOne(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "UoM not found"));
        return entity;
    }

    @Post
    @Documentation("Create UoM")
    public UoMEntity create(@Body UoMEntity entity) {
        checkPermissions("write");
        validate(entity);
        return repository.save(entity);
    }

    @Put("/{id}")
    @Documentation("Update UoM by id")
    public UoMEntity update(@PathParam("id") Integer id, @Body UoMEntity entity) {
        checkPermissions("write");
        entity.Id = id;
        validate(entity);
        return repository.update(entity);
    }

    @Delete("/{id}")
    @Documentation("Delete UoM by id")
    public void deleteById(@PathParam("id") Integer id) {
        checkPermissions("write");
        if (repository.findOne(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "UoM not found");
        }
        repository.deleteById(id);
    }

    private List<UoMEntity> runFilter(Map<String, Object> filter) {
        StringBuilder hql = new StringBuilder("from UoMEntity e");
        Map<String, Object> params = new LinkedHashMap<>();
        boolean first = true;
        if (filter != null && filter.get("equals") instanceof Map<?, ?> equals) {
            for (Map.Entry<?, ?> entry : equals.entrySet()) {
                String field = requireKnownField(String.valueOf(entry.getKey()));
                String paramName = "p" + params.size();
                hql.append(first ? " where e." : " and e.").append(field).append(" = :").append(paramName);
                params.put(paramName, entry.getValue());
                first = false;
            }
        }
        if (filter != null && filter.get("conditions") instanceof List<?> conditions) {
            for (Object raw : conditions) {
                if (!(raw instanceof Map<?, ?> condition)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filter condition");
                }
                String field = requireKnownField(String.valueOf(condition.get("propertyName")));
                String operator = String.valueOf(condition.get("operator")).toUpperCase(Locale.ROOT);
                Object value = condition.get("value");
                String paramName = "p" + params.size();
                String clause = switch (operator) {
                    case "EQ" -> "e." + field + " = :" + paramName;
                    case "IN" -> {
                        if (!(value instanceof Collection<?>)) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IN value must be a list for field: " + field);
                        }
                        yield "e." + field + " in (:" + paramName + ")";
                    }
                    case "LIKE" -> "e." + field + " like :" + paramName;
                    default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported operator: " + operator);
                };
                hql.append(first ? " where " : " and ").append(clause);
                params.put(paramName, value);
                first = false;
            }
        }
        return repository.query(hql.toString(), params);
    }

    private static String requireKnownField(String field) {
        if (!FILTER_FIELDS.contains(field)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown filter field: " + field);
        }
        return field;
    }

    private void checkPermissions(String op) {
        if ("read".equals(op) && !(UserFacade.isInRole("codbex-uoms.UnitsOfMeasures.UoMReadOnly") || UserFacade.isInRole("codbex-uoms.UnitsOfMeasures.UoMFullAccess"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if ("write".equals(op) && !UserFacade.isInRole("codbex-uoms.UnitsOfMeasures.UoMFullAccess")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private static void validate(UoMEntity entity) {
        if (entity.Name == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Name' property is required");
        }
        if (entity.Name != null && entity.Name.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Name' exceeds the maximum length of 100");
        }
        if (entity.ISO == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'ISO' property is required");
        }
        if (entity.ISO != null && entity.ISO.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'ISO' exceeds the maximum length of 20");
        }
        if (entity.Dimension == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Dimension' property is required");
        }
        if (entity.SAP != null && entity.SAP.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'SAP' exceeds the maximum length of 20");
        }
        if (entity.Numerator == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Numerator' property is required");
        }
        if (entity.Denominator == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Denominator' property is required");
        }
        if (entity.Rounding == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Rounding' property is required");
        }
    }
}
