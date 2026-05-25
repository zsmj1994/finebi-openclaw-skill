export interface QueryOptions {
  dashboardId: string;
  widgetId?: string;
  [key: string]: any;
}

// ----------------------------------------------------------------
// Filter control value types
// ----------------------------------------------------------------

export interface ControlWidgetStringValue {
  type: number;
  value: string[];
  assist: string[];
}

export interface ControlWidgetDatePointValue {
  type: number;
  value: {
    year?: number | string;
    month?: number | string;
    quarter?: number | string;
    day?: number | string;
    hour?: number | string;
    minute?: number | string;
    second?: number | string;
    position?: number;
    [key: string]: any;
  };
}

export interface ControlWidgetDateRangeValue {
  start: ControlWidgetDatePointValue | null;
  end: ControlWidgetDatePointValue | null;
}

export interface ControlWidgetNumberRangeValue {
  min: string | number;
  max: string | number;
  closeMin: boolean;
  closeMax: boolean;
}

export interface ControlWidgetTreeValue {
  [nodeName: string]: ControlWidgetTreeValue;
}

export type ControlWidgetTreeLabelValue = string[][];

// Specific component interfaces

export interface ControlYearValue {
  type: number;
  value: { year: number | string };
}

export interface ControlMonthValue {
  type: number;
  value: { year: number | string; month: number | string };
}

export interface ControlQuarterValue {
  type: number;
  value: { year: number | string; quarter: number | string };
}

export interface ControlDateValue {
  type: number;
  value: {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    hour?: number | string;
    minute?: number | string;
    second?: number | string;
  };
}

export type ControlDatePaneValue = ControlWidgetDatePointValue | null;

export type ControlDateIntervalValue = ControlWidgetDateRangeValue | null;

export interface ControlYearMonthPointValue {
  type: number;
  value: { year?: number | string; month?: number | string };
}

export interface ControlYearMonthIntervalValue {
  start: ControlYearMonthPointValue | null;
  end: ControlYearMonthPointValue | null;
}

export interface ControlDateGroupValue {
  start: ControlWidgetDatePointValue | null;
  end: ControlWidgetDatePointValue | null;
}

export type ControlNumberValue = ControlWidgetNumberRangeValue;

export interface ControlIntervalSliderValue {
  min: string | number;
  max: string | number;
  closeMin: true;
  closeMax: true;
}

export type ControlTreeSelectValue = ControlWidgetTreeValue;

export type ControlTreeLabelSelectValue = string[][];

export interface ControlStringGroupValue {
  type: number;
  value: string[];
  assist: [];
}

export type NullableControlStringGroupValue = ControlStringGroupValue | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomFilterWidgetValue = any;

export type FilterWidgetValue =
  | ControlWidgetStringValue
  | ControlWidgetDatePointValue
  | ControlWidgetDateRangeValue
  | ControlWidgetNumberRangeValue
  | ControlWidgetTreeValue
  | ControlWidgetTreeLabelValue
  | CustomFilterWidgetValue
  | null;

// ----------------------------------------------------------------

interface FilterOptionsBase {
  widgetId?: string;
  fieldId?: string;
  operator?: string;
}

export type FilterOptions =
  /** STRING (32) / NUMBER_DROP_DOWN (39) / STRING_LIST (59) / STRING_GROUP (69) */
  | (FilterOptionsBase & { widgetType: 32 | 39 | 59 | 69; filterValue?: ControlWidgetStringValue | null; value?: ControlWidgetStringValue | null })
  /** NUMBER (33) */
  | (FilterOptionsBase & { widgetType: 33; filterValue?: ControlWidgetNumberRangeValue; value?: ControlWidgetNumberRangeValue })
  /** TREE (34) / TREE_LIST (60) */
  | (FilterOptionsBase & { widgetType: 34 | 60; filterValue?: ControlWidgetTreeValue; value?: ControlWidgetTreeValue })
  /** INTERVAL_SLIDER (36) */
  | (FilterOptionsBase & { widgetType: 36; filterValue?: ControlIntervalSliderValue; value?: ControlIntervalSliderValue })
  /** TREE_LABEL (38) */
  | (FilterOptionsBase & { widgetType: 38; filterValue?: ControlWidgetTreeLabelValue; value?: ControlWidgetTreeLabelValue })
  /** DATE_INTERVAL (48) */
  | (FilterOptionsBase & { widgetType: 48; filterValue?: ControlDateIntervalValue; value?: ControlDateIntervalValue })
  /** YEAR (49) */
  | (FilterOptionsBase & { widgetType: 49; filterValue?: ControlYearValue | null; value?: ControlYearValue | null })
  /** QUARTER (50) */
  | (FilterOptionsBase & { widgetType: 50; filterValue?: ControlQuarterValue | null; value?: ControlQuarterValue | null })
  /** MONTH (51) */
  | (FilterOptionsBase & { widgetType: 51; filterValue?: ControlMonthValue | null; value?: ControlMonthValue | null })
  /** DATE / DATE_TIME (52) */
  | (FilterOptionsBase & { widgetType: 52; filterValue?: ControlDateValue | null; value?: ControlDateValue | null })
  /** DATE_PANE (61) */
  | (FilterOptionsBase & { widgetType: 61; filterValue?: ControlDatePaneValue; value?: ControlDatePaneValue })
  /** YEAR_MONTH_INTERVAL (62) */
  | (FilterOptionsBase & { widgetType: 62; filterValue?: ControlYearMonthIntervalValue; value?: ControlYearMonthIntervalValue })
  /** TIME_GROUP (68) */
  | (FilterOptionsBase & { widgetType: 68; filterValue?: ControlDateGroupValue; value?: ControlDateGroupValue })
  /** CUSTOM_STRING_FILTER_WIDGET (100) / CUSTOM_NUMBER_FILTER_WIDGET (101) / CUSTOM_DATE_FILTER_WIDGET (102) */
  | (FilterOptionsBase & { widgetType: 100 | 101 | 102; filterValue?: CustomFilterWidgetValue; value?: CustomFilterWidgetValue })
  /** widgetType 未指定 */
  | (FilterOptionsBase & { widgetType?: undefined; filterValue?: FilterWidgetValue; value?: FilterWidgetValue });

export interface LinkageTarget {
  widgetId: string;
  widgetType?: number;
  filterValue?: any;
  value?: any;
}

export interface LinkageOptions {
  dId: string,
  fieldId: string
  text: string | number;
  value?: { dId: string; fieldId: string; text: string }[];
}

export interface FineBIContext {
  window: any;
  document: any;
  dom: any;
  finebiServerUrl: string;
}
