package api;

import gen.codbex_uoms.data.settings.UoMEntity;
import gen.codbex_uoms.data.settings.UoMRepository;

import org.eclipse.dirigible.engine.java.annotations.Documentation;
import org.eclipse.dirigible.engine.java.annotations.Inject;
import org.eclipse.dirigible.engine.java.annotations.http.Controller;
import org.eclipse.dirigible.engine.java.annotations.http.Get;
import org.eclipse.dirigible.engine.java.annotations.http.PathParam;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
/**
 * Converts Source UoM to Target UoM the given Value
 * Example: http://host:port/services/ts/codbex-uoms/api/ConverterController.ts/KGM/GRM/50
 */

@Controller
@Documentation("codbex-uoms - Converter Controller")
public class ConverterController {

    @Inject
    private UoMRepository repository;

    @Get("/{source}/{target}/{value}")
    @Documentation("Convert value from source UoM to target UoM")
    public Double convertValue(
        @PathParam("source") String source,
        @PathParam("target") String target,
        @PathParam("value") Double value) {

        UoMEntity entitySource = findByISO(source);
        UoMEntity entityTarget = findByISO(target);

        if (entitySource.Dimension == null || entityTarget.Dimension == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid unit dimension configuration");
        }

        if (!entitySource.Dimension.equals(entityTarget.Dimension)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Both Source and Target Unit of Measures should have the same Dimension");
        }

        if (entitySource.Numerator == null
            || entitySource.Denominator == null
            || entityTarget.Numerator == null
            || entityTarget.Denominator == null) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid conversion factors defined");
        }

        if (entitySource.Denominator == 0
            || entityTarget.Numerator == 0) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid conversion configuration (division by zero)");
        }

        double valueBase =
            value * entitySource.Numerator.doubleValue()
            / entitySource.Denominator.doubleValue();

        double valueTarget =
            valueBase * entityTarget.Denominator.doubleValue()
            / entityTarget.Numerator.doubleValue();

        return valueTarget;
    }

    private UoMEntity findByISO(String iso) {

        List < UoMEntity > result = repository.query(
            "from UoMEntity e where e.ISO = :iso",
            Map.of("iso", iso));

        if (result.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Unit of Measure not found: [" + iso + "]");
        }

        return result.get(0);
    }
}
```
