import { Controller, Get, Documentation } from "@aerokit/sdk/http"
import { Operator } from "@aerokit/sdk/db"
import { UoMRepository } from "../gen/codbex-uoms/data/Settings/UoMRepository"
import { HttpUtils } from "@aerokit/sdk/http/utils"

/**
 * Converts Source UoM to Target UoM the given Value
 * Example: http://host:port/services/ts/codbex-uoms/api/ConverterController.ts/KGM/GRM/50
 */

@Documentation('codbex-uoms - Converter Controller')
@Controller
class ConverterController {

    private readonly repository = new UoMRepository();

    @Get("/:source/:target/:value")
    public convertValue(_: any, ctx: any): number {
        try {
            const source = ctx.pathParameters.source;
            const target = ctx.pathParameters.target;
            const value = parseFloat(ctx.pathParameters.value);
            const entitySource = this.repository.findAll({
                conditions: [
                    {
                        operator: Operator.EQ,
                        propertyName: 'ISO',
                        value: source
                    }
                ]
            })[0];
            const entityTarget = this.repository.findAll({
                conditions: [
                    {
                        operator: Operator.EQ,
                        propertyName: 'ISO',
                        value: target
                    }
                ]
            })[0];
            if (entitySource && entityTarget) {
                if (entitySource.Dimension !== entityTarget.Dimension) {
                    HttpUtils.sendResponseBadRequest("Both Source and Target Unit of Measures should have the same Dimension");
                    return;
                }
                const valueBase = value * entitySource.Numerator / entitySource.Denominator;
                const valueTarget = valueBase * entityTarget.Denominator / entityTarget.Numerator;
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
