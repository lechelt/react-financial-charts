import { rebind } from "../utils/index";
import { kagi } from "../calculator/index";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "Kagi";

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = kagi();

    const indicator = underlyingAlgorithm;

    rebind(indicator, base, "id", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "dateAccessor", "dateMutator", "options");

    return indicator;
}
