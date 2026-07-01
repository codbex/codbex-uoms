package gen.codbex_uoms.api.settings;

import gen.codbex_uoms.data.settings.DimensionEntity;
import gen.codbex_uoms.data.settings.DimensionRepository;

import org.eclipse.dirigible.components.api.security.UserFacade;
import org.eclipse.dirigible.sdk.platform.Documentation;
import org.eclipse.dirigible.sdk.http.Body;
import org.eclipse.dirigible.sdk.http.Controller;
import org.eclipse.dirigible.sdk.http.Delete;
import org.eclipse.dirigible.sdk.http.Get;
import org.eclipse.dirigible.sdk.http.PathParam;
import org.eclipse.dirigible.sdk.http.Post;
import org.eclipse.dirigible.sdk.http.Put;
import org.eclipse.dirigible.sdk.http.QueryParam;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Controller
@Documentation("codbex-uoms - Dimension Controller")
public class DimensionController {

    private static final Set<String> FILTER_FIELDS = Set.of("Id", "Name", "SAP");

    private final DimensionRepository repository;

    public DimensionController(DimensionRepository repository) {
        this.repository = repository;
    }

    @Get
    @Documentation("List Dimension")
    public List<DimensionEntity> getAll(@QueryParam("$limit") Integer limit,
                                      @QueryParam("$offset") Integer offset) {
        checkPermissions("read");
        int actualLimit = limit != null ? limit.intValue() : 20;
        int actualOffset = offset != null ? offset.intValue() : 0;
        List<DimensionEntity> result = repository.findAll(actualLimit, actualOffset);
        return result;
    }

    @Get("/count")
    @Documentation("Count Dimension")
    public Map<String, Long> count() {
        checkPermissions("read");
        return Map.of("count", repository.count());
    }

    @Post("/count")
    @Documentation("Count Dimension with filter")
    public Map<String, Long> countWithFilter(@Body Map<String, Object> filter) {
        checkPermissions("read");
        return Map.of("count", (long) runFilter(filter).size());
    }

    @Post("/search")
    @Documentation("Search Dimension")
    public List<DimensionEntity> search(@Body Map<String, Object> filter) {
        checkPermissions("read");
        List<DimensionEntity> result = runFilter(filter);
        return result;
    }

    @Get("/{id}")
    @Documentation("Get Dimension by id")
    public DimensionEntity getById(@PathParam("id") Integer id) {
        checkPermissions("read");
        DimensionEntity entity = repository.findOne(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dimension not found"));
        return entity;
    }

    @Post
    @Documentation("Create Dimension")
    public DimensionEntity create(@Body DimensionEntity entity) {
        checkPermissions("write");
        validate(entity);
        return repository.save(entity);
    }

    @Put("/{id}")
    @Documentation("Update Dimension by id")
    public DimensionEntity update(@PathParam("id") Integer id, @Body DimensionEntity entity) {
        checkPermissions("write");
        entity.Id = id;
        validate(entity);
        return repository.update(entity);
    }

    @Delete("/{id}")
    @Documentation("Delete Dimension by id")
    public void deleteById(@PathParam("id") Integer id) {
        checkPermissions("write");
        if (repository.findOne(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dimension not found");
        }
        repository.deleteById(id);
    }

    private List<DimensionEntity> runFilter(Map<String, Object> filter) {
        StringBuilder hql = new StringBuilder("from DimensionEntity e");
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
        if ("read".equals(op) && !(UserFacade.isInRole("codbex-uoms.Dimensions.DimensionReadOnly") || UserFacade.isInRole("codbex-uoms.Dimensions.DimensionFullAccess"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        if ("write".equals(op) && !UserFacade.isInRole("codbex-uoms.Dimensions.DimensionFullAccess")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    private static void validate(DimensionEntity entity) {
        if (entity.Name == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Name' property is required");
        }
        if (entity.Name != null && entity.Name.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Name' exceeds the maximum length of 100");
        }
        if (entity.SAP != null && entity.SAP.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'SAP' exceeds the maximum length of 20");
        }
    }
}
