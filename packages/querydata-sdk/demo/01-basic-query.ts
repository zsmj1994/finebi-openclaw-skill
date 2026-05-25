import { FineBIQueryDataSDK } from '../src/index';

async function main() {
  let sdk: FineBIQueryDataSDK | undefined;
  try {
    console.log('-------- SDK 初始化 --------');
    // 使用您提供的那种实际在线生成类文件地址作为示例
    sdk = await FineBIQueryDataSDK.create({
      dashboardId: '6c5c1c5f38e6409889ca39537275da88',
      finebiServerUrl: 'http://192.168.5.102:38899/webroot/decision',
    });
    console.log('环境准备完毕。');

    // 1. 测试数据查询能力
    console.log('\n-------- 执行数据查询 --------');
    sdk.filter?.applyFilter(
      {
        "widgetId": "ef431839897df1c5",
        "widgetType": 32,
        "filterValue": {
          "type": 1,
          "value": [
            "基础财务"
          ],
          "assist": [
            "服务协议",
            "长期协议",
            "长期协议订单"
          ]
        }
      }
    );

    sdk.linkage?.applyLinkage('b5c048d05f6a81c9', {
      "dId": "769956e753df1a55",
      "fieldId": "69b6d5085ded437c82c76958caa1a75c_[603b][91d1][989d]",
      "text": 360714.28571428574,
      "value": [
        {
          "dId": "1156cc321e910662",
          "fieldId": "69b6d5085ded437c82c76958caa1a75c_[5408][540c][7c7b][578b]",
          "text": "长期协议"
        }
      ]
    })

    const queryResult = await sdk.query?.getWidgetData('77bfd79358ab60cf');

    console.log('接收到查询结果:', queryResult.data);

  } catch (error) {
    console.error('Demo执行出现异常:', error);
  } finally {
    sdk?.destroy();
    console.log('\n资源已释放...');
  }
}

main();
