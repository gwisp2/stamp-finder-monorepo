import { SfDatabase, Stamp } from '../api/SfDatabase.ts';
import { StateCreator } from 'zustand';
import { SfDatabaseSlice } from './database.slice.ts';
import { ComboFormHandle, ComboOptions, zComboOptions } from '../model/ComboOptions.ts';
import { StampCombo } from '../model/StampCombo.tsx';
import _ from 'lodash';

export interface ComboPageSliceProps {
  database: SfDatabase;
  comboFormHandle: ComboFormHandle;
}

export interface ComboPageSlice {
  comboFormHandle: ComboFormHandle;
  comboOptions: ComboOptions;
  comboAcceptedStamps: Stamp[];
  foundCombos: StampCombo[];

  setComboOptions(options: ComboOptions): void;
}

interface DpComboEntry {
  group: StampGroup;
  totalWeight: number;
  prev?: DpComboEntry;
}

/* A group of stamps with the same weight (value to minimize for combos) and value  */
interface StampGroup {
  stamps: Stamp[];
  weight: number;
  value: number;
  id: number; // lowest id of all stamps
}

export function findCombos(stamps: Stamp[], options: ComboOptions): StampCombo[] {
  if (options.value.start === null || options.value.end === null) {
    // unbound search is not supported
    return [];
  }

  // Select allowed stamps & form groups with the same value & weight
  // Stamps within a group are interchangeable
  const acceptedStamps = stamps.filter((s) => options.isAcceptedStamp(s) && Number.isInteger(s.value));
  const stampGroups: StampGroup[] = Object.values(
    _.groupBy(acceptedStamps, (s) => `${s.value} ${options.sort.computeStampWeight(s)}`),
  ).map((sameGroupStamps) => ({
    stamps: sameGroupStamps,
    weight: options.sort.computeStampWeight(sameGroupStamps[0]),
    value: sameGroupStamps[0].value!,
    id: _.min(sameGroupStamps.map((s) => s.id))!,
  }));
  if (stampGroups.length === 0) {
    return [];
  }

  //
  console.log(`${stampGroups.length} stamp groups, ${acceptedStamps.length} stamps`);

  const startTime = performance.now();

  // Extract options
  const nMaxResults = 100;
  const nStamps = options.nOfStamps;
  const minTargetValue = options.value.start;
  const maxTargetValue = options.value.end;

  // dp[i][j] contains a set of entries, each entry describes how to make a set of (i + 1) stamps with the total value of j
  const dp: DpComboEntry[][][] = [];

  for (let layer = 1; layer <= nStamps; layer++) {
    // create a layer for the next amount of stamps
    dp[layer - 1] = Array(maxTargetValue + 1);
    for (let i = 0; i <= maxTargetValue; i++) {
      dp[layer - 1][i] = [];
    }

    // populate it
    for (const g of stampGroups) {
      if (layer === 1 && g.value <= maxTargetValue) {
        // it is the first layer
        dp[layer - 1][g.value].push({
          group: g,
          totalWeight: g.weight,
        });
      } else if (layer > 1) {
        const isLastLayer = layer === options.nOfStamps;
        const pValueL = !isLastLayer ? 0 : Math.max(minTargetValue - g.value!, 0);
        const pValueU = maxTargetValue - g.value!;
        for (let pValue = pValueL; pValue <= pValueU; pValue++) {
          dp[layer - 2][pValue].forEach((entry) => {
            if (entry.group.id >= g.id) {
              // to avoid duplicates each next stamp group must have id greater or equal than the previous one
              const newWeight = entry.totalWeight + g.weight;
              dp[layer - 1][pValue + g.value!].push({
                group: g,
                totalWeight: newWeight,
                prev: entry,
              });
            }
          });
        }
      }
    }

    // sort by weight and keep the best
    for (let value = 0; value <= maxTargetValue!; value++) {
      dp[layer - 1][value] = _.sortBy(dp[layer - 1][value], (e) => e.totalWeight).slice(0, nMaxResults);
    }
  }

  function comboFromEntryChain(entry: DpComboEntry): StampCombo {
    const stamps: Stamp[] = [];
    let cur: DpComboEntry | undefined = entry;
    while (cur) {
      stamps.push(cur.group.stamps[Math.floor(Math.random() * cur.group.stamps.length)]);
      cur = cur.prev;
    }
    return new StampCombo(stamps);
  }

  const combos: StampCombo[] = [];
  for (let value = minTargetValue; value <= maxTargetValue; value++) {
    for (const entry of dp[options.nOfStamps - 1][value]) {
      combos.push(comboFromEntryChain(entry));
    }
  }

  const endTime = performance.now();
  console.log(`${endTime - startTime} ms`);

  return combos;
}

export const createComboSlice: (
  props: ComboPageSliceProps,
) => StateCreator<SfDatabaseSlice & ComboPageSlice, [], [], ComboPageSlice> = (props) => {
  // Build SearchOptions from initial form data
  const initialOptionsResult = zComboOptions.safeParse(props.comboFormHandle.context.getValues());
  const initialOptions = initialOptionsResult.success ? initialOptionsResult.data : ComboOptions.Default;
  // Initialize slice data
  return (set) => ({
    comboFormHandle: props.comboFormHandle,
    comboOptions: initialOptions,
    comboAcceptedStamps: initialOptions.filterAcceptedStamps(props.database.stamps),
    foundCombos: [],
    setComboOptions: (options: ComboOptions) =>
      set((state) => ({
        comboOptions: options,
        comboAcceptedStamps: options.filterAcceptedStamps(state.database.stamps),
        foundCombos: findCombos(state.database.stamps, options),
      })),
  });
};
