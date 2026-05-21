import { FineBIQueryDataSDK } from '../src/index';

async function main() {
  let sdk: FineBIQueryDataSDK | undefined;
  try {
    console.log('-------- SDK 初始化 --------');
    sdk = await FineBIQueryDataSDK.create({
      dashboardId: 'test-dashboard-456',
      finebiServerUrl: 'http://192.168.5.172:10998',
      scripts: [
        `/webroot/decision/file?path=com.finebi.dashboard.impl.service.pool.generate.ViewBasicPoolTextGenerator&type=class&parser=plain&reportId=9c5677e2dcd34cc09cb3b0b55305c80d&entryType=1&t=1776323819022&tag=1776322617089`,
        `/webroot/decision/file?path=/com/finebi/export/js/fineui-base.min.js`,
        `/webroot/decision/file?path=com.finebi.foundation.api.web.component.BICommonDesignConstantGenerator&type=class&parser=plain&tag=1776322617089`,
        `/webroot/decision/file?path=com.finebi.foundation.api.web.component.I18nTextGenerator&time=1776323819022&type=class&parser=plain&tag=1776322617089`,
        `/webroot/decision/file?path=/com/finebi/web/js/static.min.js`,
      ]
    });
    console.log('环境准备完毕。');

    // 2. 测试应用过滤器能力
    console.log('\n-------- 挂载/应用过滤器 --------');
    const success = await sdk.filter?.applyFilter({
      fieldId: 'area', // 过滤字段：地区
      value: '华东区', // 过滤值
      operator: 'in'
    });

    if (success) {
      console.log('过滤器挂载更新成功！');
    }

  } catch (error) {
    console.error('Demo执行出现异常:', error);
  } finally {
    sdk?.destroy();
    console.log('\n资源已释放...');
  }
}

main();
