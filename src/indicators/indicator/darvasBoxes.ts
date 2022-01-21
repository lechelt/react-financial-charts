import { merge, rebind } from "../utils/index";
import { darvasbox } from "../calculator/index";
import baseIndicator from "./baseIndicator";
import { DarvasBoxOptions } from "../calculator/darvasbox";

const ALGORITHM_TYPE = "DarvasBoxes";

interface DarvasBoxesIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): DarvasBoxesIndicator;
    accessor(): any;
    accessor(x: any): DarvasBoxesIndicator;
    stroke(): string | any;
    stroke(x: string | any): DarvasBoxesIndicator;
    fill(): string | any;
    fill(x: string | any): DarvasBoxesIndicator;
    echo(): any;
    echo(x: any): DarvasBoxesIndicator;
    type(): string;
    type(x: string): DarvasBoxesIndicator;
    merge(): any;
    merge(newMerge: any): DarvasBoxesIndicator;
    options(): DarvasBoxOptions;
    options(newOptions: DarvasBoxOptions): DarvasBoxesIndicator;
}

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = darvasbox();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.bollingerBand = i;
        });

    const indicator = (data: any[], options = { merge: true }) => {
        if (options.merge) {
            if (!base.accessor()) {
                throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`);
            }

            return mergedAlgorithm(data);
        }
        return underlyingAlgorithm(data);
    };

    rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator as DarvasBoxesIndicator;
}
