import { FineBIContext } from '../types';
import { merge } from 'lodash-es';

export function initTemplateHelper(context: FineBIContext) {
    const { window } = context;
    if (!window.BI) {
        throw new Error('FineBI SDK (window.BI) not found in the simulated environment.');
    }

    const BI = window.BI;

    const { sessionId, subjectId, basePool = {}, pool = {}, designConfigure = {}, reportName = {} } = BI;
    const { confPool, systemPool } = pool;
    const { entryType, link } = basePool;
    const reportId = designConfigure.reportId;
    const reportWidgets = designConfigure.reportWidgets || [];
    designConfigure.reportWidgets = reportWidgets;

    BI.designData = merge({},
        merge(BI.Constants.getConstant('bi.constant.design.template.conf')),
        designConfigure, { isEdit: false }
    );

    const templatehelperProps = {
        ...BI.designData,
        pool: pool,
        basePool: basePool,
        entryType: 1,
        position: 0,
        subjectId: subjectId,
    }
    const templateHelper = new BI.TemplateHelper(templatehelperProps);
    templateHelper.syncWidgets();

    return templateHelper;
}