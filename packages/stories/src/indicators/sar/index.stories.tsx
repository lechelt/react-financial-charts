import * as React from "react";
import { SARSeries } from "../../../../series/src/SARSeries";
import SARIndicator from "./SarIndicator.js";

export default {
    title: "Visualization/Indicator/SAR",
    component: SARSeries,
};

export const basic = () => <SARIndicator />;
