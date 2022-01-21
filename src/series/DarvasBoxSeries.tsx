import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";
import { AreaOnlySeries } from "./AreaOnlySeries";

export interface DarvasBoxSeriesProps {
    readonly areaClassName?: string;
    readonly className?: string;
    readonly fillStyle?: string;
    readonly yAccessor?: (data: any) => { bottom: number; middle: number; top: number };
}

export class DarvasBoxSeries extends React.Component<DarvasBoxSeriesProps> {
    public static defaultProps = {
        areaClassName: "react-financial-charts-darvas-box-series-area",
        fillStyle: "rgba(38, 166, 153, 0.05)",
        strokeStyle: {
            top: "#26a69a",
            middle: "#812828",
            bottom: "#26a69a",
        },
        yAccessor: (data: any) => data.bb,
    };

    public render() {
        const { className, fillStyle } = this.props;

        return (
            <g className={className}>
                <AreaOnlySeries
                    yAccessor={this.yAccessorForTop}
                    base={this.yAccessorForScaledBottom}
                    fillStyle={fillStyle}
                />
            </g>
        );
    }

    private readonly yAccessorForScaledBottom = (scale: ScaleContinuousNumeric<number, number>, d: any) => {
        const { yAccessor = DarvasBoxSeries.defaultProps.yAccessor } = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        return scale(bb.bottom);
    };

    private readonly yAccessorForBottom = (d: any) => {
        const { yAccessor = DarvasBoxSeries.defaultProps.yAccessor } = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        return bb.bottom;
    };

    private readonly yAccessorForMiddle = (d: any) => {
        const { yAccessor = DarvasBoxSeries.defaultProps.yAccessor } = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        return bb.middle;
    };

    private readonly yAccessorForTop = (d: any) => {
        const { yAccessor = DarvasBoxSeries.defaultProps.yAccessor } = this.props;

        const bb = yAccessor(d);
        if (bb === undefined) {
            return undefined;
        }

        return bb.top;
    };
}
