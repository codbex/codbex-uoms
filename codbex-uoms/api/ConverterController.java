package api;

import gen.codbex_uoms.data.settings.UoMEntity;
import gen.codbex_uoms.data.settings.UoMRepository;

import org.eclipse.dirigible.sdk.platform.Documentation;
import org.eclipse.dirigible.sdk.component.Inject;
import org.eclipse.dirigible.sdk.http.Controller;
import org.eclipse.dirigible.sdk.http.Get;
import org.eclipse.dirigible.sdk.http.PathParam;
import org.eclipse.dirigible.sdk.http.Response;

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

        if (entitySource.Dimension == null || entitySource.Numerator == null || entitySource.Denominator == null 
            || entitySource.Numerator == 0 || entitySource.Denominator == 0) {
            
            Response.setStatus(400);
            Response.println("Invalid Source configuration");
            return null;
        }
        
        if (entityTarget.Dimension == null || entityTarget.Numerator == null || entityTarget.Denominator == null 
            || entityTarget.Numerator == 0 || entityTarget.Denominator == 0) {
            
            Response.setStatus(400);
            Response.println("Invalid Target configuration");
            return null;
        }
        
        if (!entitySource.Dimension.equals(entityTarget.Dimension)) {
            Response.setStatus(400);
            Response.println("Dimensions mismatch");
            return null;
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

        List<UoMEntity> result = repository.query(
            "from UoMEntity e where e.ISO = :iso",
            Map.of("iso", iso));

        if (result.isEmpty()) {
            Response.setStatus(404);
            Response.println("Unit of Measure not found: [" + iso + "]");
            return new UoMEntity(); 
        }

        return result.get(0);
    }
}
