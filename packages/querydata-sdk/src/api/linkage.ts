import { FineBIContext, LinkageOptions, LinkageTarget } from '../types';

export class LinkageAPI {
    private context: FineBIContext;
    private templateHelper: any;

    constructor(context: FineBIContext, templateHelper: any) {
        this.context = context;
        this.templateHelper = templateHelper;
    }

    private setWidgetValue(target: LinkageTarget): boolean {
        if (!target.widgetId) {
            return false;
        }

        const { window } = this.context;
        const BI = window.BI;
        const helper = this.templateHelper.getWidgetHelper?.(target.widgetId);
        const widget = helper?.getWidget?.();

        if (!widget) {
            return false;
        }

        if (target.widgetType != null && widget.type !== target.widgetType) {
            return false;
        }

        const value = target.filterValue ?? target.value ?? null;

        if (BI?.Fix?.set) {
            BI.Fix.set(widget, 'value', value);
        } else {
            widget.value = value;
        }

        return true;
    }

    private uniqCrossCellClickedValue(value: any[]): any[] {
        if (!Array.isArray(value)) {
            return [];
        }

        return value.reduce((previousValue: any[], currentValue: any) => {
            if (previousValue.length === 0) {
                return [currentValue];
            }

            const last = previousValue[previousValue.length - 1];
            if (last?.dId !== currentValue?.dId) {
                return [...previousValue, currentValue];
            }

            return previousValue;
        }, []);
    }

    private clearDrillSequence(widgetHelper: any) {
        const widget = widgetHelper?.getWidget?.();
        if (!widget) {
            return;
        }

        const widgetMeasures = Array.isArray(widget.widgetMeasures) ? widget.widgetMeasures : [];
        for (const widgetMeasure of widgetMeasures) {
            const groups = Array.isArray(widgetMeasure?.group) ? widgetMeasure.group : [];
            for (const group of groups) {
                if (Array.isArray(group?.drillSequence)) {
                    group.drillSequence = [];
                }
            }
        }

        widget.drillOrder = [];
    }

    /**
     * 应用联动结果到目标组件
     */
    public async applyLinkage(wId: string, linkage: LinkageOptions): Promise<boolean> {
        const { window } = this.context;

        if (!window.BI) {
            throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
        }

        try {
            const payload = Array.isArray(linkage) ? linkage[0] : linkage;
            const BI = window.BI;
            const dId = payload?.dId;
            const value = Array.isArray(payload?.value) ? payload.value : [];
            const fieldId = payload?.fieldId;

            if (!wId) {
                return false;
            }

            const widgetHelper = this.templateHelper.getWidgetHelper?.(wId);
            const widget = widgetHelper?.getWidget?.();
            if (!widget) {
                return false;
            }

            const clicked = {
                dId,
                value: this.uniqCrossCellClickedValue(value),
                fieldId
            };

            if (BI?.Fix?.set) {
                BI.Fix.set(widget, 'clicked', clicked);
            } else if (window.Fix?.set) {
                window.Fix.set(widget, 'clicked', clicked);
            } else {
                widget.clicked = clicked;
            }

            const links = widgetHelper.getAllLinkageWidgets?.() || [];
            const widgets = this.templateHelper.getWidgets?.() || {};
            const currentClicked = widget.clicked;

            for (const linkWId of links) {
                this.clearDrillSequence(this.templateHelper.getWidgetHelper?.(linkWId));

                widgets[linkWId] = widgets[linkWId] || {};
                widgets[linkWId].linkage = widgets[linkWId].linkage || {};

                if (currentClicked == null || currentClicked.value == null) {
                    delete widgets[linkWId].linkage[wId];
                } else {
                    widgets[linkWId].linkage[wId] = {};
                }
            }

            return true;
        } catch (error) {
            console.error('Error applying linkage:', error);
            throw error;
        }
    }

    /**
     * 清除组件联动
     */
    public cancelLinkage(wId: string) {
        const { window } = this.context;
        const BI = window.BI;
        const widgetHelper = this.templateHelper.getWidgetHelper(wId);
        const widget = widgetHelper.getWidget();

        BI.Fix.del(widget, 'clicked');
        widgetHelper.updateLinkage();
    }

    /**
     * 清空联动目标值
     */
    public async clearLinkage(widgetIds: string[]): Promise<boolean> {
        return true
    }
}