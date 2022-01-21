/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/bollingerBands.js

The MIT License (MIT)

Copyright (c) 2014-2015 Scott Logic Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { DarvasBox, DarvasBox as defaultOptions } from "./defaultOptionsForComputation";

export interface DarvasBoxOptions {

}

interface DarvasBoxCalculator {
    (data: any[]): any;
    undefinedLength(): number;
    options(): DarvasBoxOptions;
    options(newOptions: DarvasBoxOptions): DarvasBoxCalculator;
}

const ArrayMaximum = (arr: Array<number>, lowerBoundaryIndex: number, upperBoundaryIndex: number): number => {
    if (arr.length === 0) {
        return -1;
    }

    let refIdx = lowerBoundaryIndex;

    for (let i = lowerBoundaryIndex + 1; i <= upperBoundaryIndex; i++) {
        if (arr[i] > arr[refIdx]) {
            refIdx = i;
        }
    }

    return refIdx;
}

const ArrayMinimum = (arr: Array<number>, lowerBoundaryIndex: number, upperBoundaryIndex: number): number => {
    if (arr.length === 0) {
        return -1;
    }

    let refIdx = lowerBoundaryIndex;

    for (let i = lowerBoundaryIndex + 1; i <= upperBoundaryIndex; i++) {
        if (arr[i] < arr[refIdx]) {
            refIdx = i;
        }
    }

    return refIdx;
}

export default function () {
    let options: DarvasBoxOptions = defaultOptions;

    const calculator = (data: any[]) => {
        // const { } = options;

        const one_day_in_milliseconds = 24 * 60 * 60 * 1000;
        const darvas_high_reset_time_boundary = 52 * 7 * one_day_in_milliseconds;

        const darvasboxAlgorithm = (data: any[]) => {
            const DarvasBoxHigh = [] as Array<number>;
            const DarvasBoxLow = [] as Array<number>;

            const Status = [] as Array<number>;
            const DarvasBoxHighRef = [] as Array<number>;
            const DarvasBoxLowRef = [] as Array<number>;
            const DarvasBoxHighRefIndex = [] as Array<number>;
            const DarvasBoxLowRefIndex = [] as Array<number>;

            const open = data.map(d => d.open);
            const low = data.map(d => d.low);
            const high = data.map(d => d.high);
            const close = data.map(d => d.close);
            const time = data.map(d => new Date(d.date));

            let max_look_back_index = 0;
            let max_look_back_high = 0.0;

            const lookForNewHigh = (high: Array<number>, time: Array<Date>, i: number): void => {
                let look_for_new_high = false;

                while (time[max_look_back_index].valueOf() + darvas_high_reset_time_boundary < time[i].valueOf()) {
                    max_look_back_index++;
                    max_look_back_high = high[max_look_back_index];
                    look_for_new_high = true;
                }

                if (look_for_new_high) {
                    const j = ArrayMaximum(high, max_look_back_index, i - max_look_back_index);
                    max_look_back_high = high[j];
                    max_look_back_index = j;
                }

                if (high[i] > max_look_back_high) {
                    max_look_back_high = high[i];
                    max_look_back_index = i;
                }
            }

            const reset = (high_value: number, high_index: number, current_index: number): void => {
                DarvasBoxHighRef[current_index] = high_value;
                DarvasBoxLowRef[current_index] = Number.MAX_VALUE;
                DarvasBoxHighRefIndex[current_index] = high_index;
                DarvasBoxLowRefIndex[current_index] = -1;
            }

            const getDarvasHighBarsBack = (current_index: number): number => {
                const darvas_high_ref_index = DarvasBoxHighRefIndex[current_index];

                if (darvas_high_ref_index != -1) {
                    return current_index - darvas_high_ref_index;
                }

                return -1;
            }

            const getDarvasLowBarsBack = (current_index: number): number => {
                const darvas_low_ref_index = DarvasBoxLowRefIndex[current_index];

                if (darvas_low_ref_index != -1) {
                    return current_index - darvas_low_ref_index;
                }

                return -1;
            }

            const setDarvasBox = (current_index: number) => {
                const darvas_high_ref_index = DarvasBoxHighRefIndex[current_index];
                const darvas_high_ref = DarvasBoxHighRef[current_index];
                const darvas_low_ref = DarvasBoxLowRef[current_index];

                for (let j = darvas_high_ref_index; j <= current_index; j++) {
                    DarvasBoxHigh[j] = darvas_high_ref;
                    DarvasBoxLow[j] = darvas_low_ref;
                }
            }

            const unsetDarvasBox = (current_index) => {
                const darvas_high_ref_index = DarvasBoxHighRefIndex[current_index];

                for (let j = darvas_high_ref_index; j <= current_index; j++) {
                    DarvasBoxHigh[j] = 0.0;
                    DarvasBoxLow[j] = 0.0;
                }
            }

            const bootstrap = () => {
                return data.map((val, i) => {
                    return {
                        top: DarvasBoxHigh[i],
                        bottom: DarvasBoxLow[i]
                    }
                });
            }

            //--- initial values
            reset(high[0], 0, 0);
            Status[0] = 1;

            max_look_back_index = 0;
            max_look_back_high = high[max_look_back_index];

            for (let i = 1; i < data.length; i++) {
                lookForNewHigh(high, time, i);

                //--- init buffer values for current index
                DarvasBoxHigh[i] = 0.0;
                DarvasBoxLow[i] = 0.0;
                DarvasBoxHighRef[i] = DarvasBoxHighRef[i - 1];
                DarvasBoxLowRef[i] = DarvasBoxLowRef[i - 1];
                DarvasBoxHighRefIndex[i] = DarvasBoxHighRefIndex[i - 1];
                DarvasBoxLowRefIndex[i] = DarvasBoxLowRefIndex[i - 1];

                //--- get status of previous bar
                const status = Status[i - 1];

                switch (status) {
                    //--- Look for Darvas High
                    case 1:
                        if (high[i] > DarvasBoxHighRef[i] || high[i] >= max_look_back_high) { // new high was found
                            Status[i] = 1;
                            reset(high[i], i, i);
                        } else if (getDarvasHighBarsBack(i) >= 3) { // 3 days in a row below latest high
                            Status[i] = 2;

                            const darvas_high_ref_index = DarvasBoxHighRefIndex[i];
                            const new_darvas_low_ref_index = ArrayMinimum(low, darvas_high_ref_index, i - darvas_high_ref_index + 1);
                            const new_darvas_low_ref = low[new_darvas_low_ref_index];

                            DarvasBoxLowRefIndex[i] = new_darvas_low_ref_index;
                            DarvasBoxLowRef[i] = new_darvas_low_ref;
                        } else {
                            Status[i] = 1;
                        }
                        break;

                    //--- Look for Darvas Low
                    case 2:
                        unsetDarvasBox(i);

                        if (high[i] > DarvasBoxHighRef[i]) {
                            Status[i] = 1;
                            reset(high[i], i, i);
                        } else if (low[i] < DarvasBoxLowRef[i]) {
                            Status[i] = 2;

                            const new_darvas_low_ref_index = i;
                            const new_darvas_low_ref = low[i];

                            DarvasBoxLowRefIndex[i] = new_darvas_low_ref_index;
                            DarvasBoxLowRef[i] = new_darvas_low_ref;
                        } else if (getDarvasHighBarsBack(i) >= 3 && getDarvasLowBarsBack(i) >= 3) {
                            Status[i] = 3;
                            setDarvasBox(i);
                        } else {
                            Status[i] = 2;
                        }

                        break;

                    //--- Look for Breakout
                    case 3:
                        if (close[i] > DarvasBoxHighRef[i] || open[i] > DarvasBoxHighRef[i]) { // Breakout to the upper boundary
                            Status[i] = 1;
                            reset(high[i], i, i);
                        } else if (close[i] < DarvasBoxLowRef[i] || open[i] < DarvasBoxLowRef[i]) { //  Breakout to the lower boundary
                            Status[i] = 1;
                            reset(DarvasBoxHighRef[i], -1, i);
                        } else {
                            Status[i] = 3;
                            setDarvasBox(i);
                        }

                        break;

                    default:
                        // there is something is odd
                        break;
                }
            }

            return bootstrap();
        }

        return darvasboxAlgorithm(data);
    };

    calculator.options = (newOptions?: DarvasBoxOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator as DarvasBoxCalculator;
}
