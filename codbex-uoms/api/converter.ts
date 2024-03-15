import { Controller, Get } from "sdk/http"
import { UoMRepository } from "../gen/dao/UnitsOfMeasures/UoMRepository";
import { HttpUtils } from "../gen/api/utils/HttpUtils";

/**
 * Converts Source UoM to Target UoM the given Value
 * Example: http://host:port/services/ts/codbex-uoms/api/converter.ts/CMT/DMT/50
 */

@Controller
class UoMConverterService {

    private readonly repository = new UoMRepository();

    @Get("/:source/:target/:value")
    public convertValue(_: any, ctx: any) {
        try {
            const source = ctx.pathParameters.source;
            const target = ctx.pathParameters.target;
            const value = parseFloat(ctx.pathParameters.value);
            const entitySource = this.repository.findById(source);
            const entityTarget = this.repository.findById(target);
            if (entitySource && entityTarget) {
                if (entitySource.Dimension !== entityTarget.Dimension) {
                    HttpUtils.sendResponseBadRequest("Both Source and Target Unit of Measures should have the same Dimension");
                    return;
                }
                let valueBase = value * entitySource.Numerator / entitySource.Denominator;
                let valueTarget = valueBase * entityTarget.Denominator / entityTarget.Numerator;
                return valueTarget;
            } else {
                HttpUtils.sendResponseNotFound("Unit of Measures not found: [" + source + "] and/or [" + target + "]");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }
}
