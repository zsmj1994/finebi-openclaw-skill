import { FineBIContext, FilterOptions } from '../types';

function isControlWidgetByWidgetType(BICst: any, widgetType: number | undefined): boolean {
  if (widgetType == null) {
    return false;
  }

  return [
    BICst.DESIGN.WIDGET.STRING,
    BICst.DESIGN.WIDGET.STRING_LIST,
    BICst.DESIGN.WIDGET.NUMBER_DROP_DOWN,
    BICst.DESIGN.WIDGET.NUMBER,
    BICst.DESIGN.WIDGET.SINGLE_SLIDER,
    BICst.DESIGN.WIDGET.INTERVAL_SLIDER,
    BICst.DESIGN.WIDGET.DATE_INTERVAL,
    BICst.DESIGN.WIDGET.MONTH,
    BICst.DESIGN.WIDGET.QUARTER,
    BICst.DESIGN.WIDGET.TREE,
    BICst.DESIGN.WIDGET.TREE_LIST,
    BICst.DESIGN.WIDGET.TREE_LABEL,
    BICst.DESIGN.WIDGET.YEAR,
    BICst.DESIGN.WIDGET.DATE,
    BICst.DESIGN.WIDGET.DATE_PANE,
    BICst.DESIGN.WIDGET.YEAR_MONTH_INTERVAL,
    BICst.DESIGN.WIDGET.GENERAL_QUERY,
    BICst.DESIGN.WIDGET.TIME_GROUP,
    BICst.DESIGN.WIDGET.STRING_GROUP
  ].includes(widgetType);
}

export class FilterAPI {
  private context: FineBIContext;
  private templateHelper: any;

  constructor(context: FineBIContext, templateHelper: any) {
    this.context = context;
    this.templateHelper = templateHelper;
  }

  /**
   * 应用过滤器
   */
  public async applyFilter(filters: FilterOptions | FilterOptions[]): Promise<boolean> {
    const { window } = this.context;
    const BI = window.BI;
    const BICst = window.BICst;

    if (!window.BI) {
      throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
    }

    try {
      const filterArray = Array.isArray(filters) ? filters : [filters];
      const controlFilters = filterArray.filter(item => {
        const widgetId = item.widgetId;
        const widgetHelper = widgetId ? this.templateHelper.getWidgetHelper?.(widgetId) : null;
        const widgetType = item.widgetType ?? widgetHelper?.getWidgetType?.();
        return Boolean(widgetId && isControlWidgetByWidgetType(BICst, widgetType));
      });

      const appliedWidgetIds: string[] = [];

      for (const item of controlFilters) {
        const widgetId = item.widgetId;
        if (!widgetId) {
          continue;
        }

        const helper = this.templateHelper.getWidgetHelper(widgetId);
        const widget = helper?.getWidget?.();
        if (!widget) {
          continue;
        }

        let value = item.filterValue ?? item.value;
        if (item.widgetType != null && widget.type !== item.widgetType) {
          value = null;
        } else if (
          widget.singleSelect === BICst.STRING_CONTROL.SINGLE &&
          BI.isNotNull(value) &&
          typeof value === 'object'
        ) {
          const selectedValues = Array.isArray(value.value) ? value.value : [];
          if ((value.type === 1 && selectedValues.length > 1) || value.type !== 1) {
            value = null;
          }
        }

        if (widget.useOptionRange && BI.isNull(value)) {
          continue;
        }

        if (widget.useCustom && BI.isNotEmptyArray(widget.customValue) && value && typeof value === 'object') {
          let values = Array.isArray(value.value) ? value.value : [];
          let assist = Array.isArray(widget.customValue) ? [...widget.customValue] : [];
          let type = value.type;
          const incomingAssist = Array.isArray(value.assist) ? value.assist : [];

          if (
            Array.isArray(value.value) &&
            value.value.length === 0 &&
            widget.customValue.some((customValue: any) => !incomingAssist.includes(customValue))
          ) {
            values = widget.customValue.filter((customValue: any) => incomingAssist.includes(customValue));
            type = 1;
          } else {
            values = values.filter((selectedValue: any) => widget.customValue.includes(selectedValue));
          }

          assist = assist.filter((customValue: any) => !values.includes(customValue));
          value = {
            ...value,
            type,
            value: values,
            assist
          };
        }

        if (widget.type === BICst.DESIGN.WIDGET.TIME_GROUP) {
          if (BI.Fix?.set) {
            BI.Fix.set(widget, 'currentTimeTagId', value?.currentTimeTagId || '');
          } else {
            widget.currentTimeTagId = value?.currentTimeTagId || '';
          }
          value = value?.value ?? null;
        }

        if (BI.Fix?.set) {
          BI.Fix.set(widget, 'value', value);
        } else {
          widget.value = value;
        }

        appliedWidgetIds.push(widgetId);
      }

      console.log('Applied filters:', appliedWidgetIds);
      return true;
    } catch (error) {
      console.error('Error applying filter:', error);
      throw error;
    }
  }
}
