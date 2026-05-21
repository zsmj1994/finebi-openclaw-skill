export interface QueryOptions {
    dashboardId: string;
    widgetId?: string;
    [key: string]: any;
}
export interface FilterOptions {
    widgetId?: string;
    widgetType?: number;
    filterValue?: any;
    fieldId?: string;
    value?: any;
    operator?: string;
}
export interface LinkageTarget {
    widgetId: string;
    widgetType?: number;
    filterValue?: any;
    value?: any;
}
export interface LinkageOptions {
    dId: string;
    fieldId: string;
    text: string | number;
    value?: {
        dId: string;
        fieldId: string;
        text: string;
    }[];
}
export interface FineBIContext {
    window: any;
    document: any;
    dom: any;
    finebiServerUrl: string;
}
//# sourceMappingURL=index.d.ts.map