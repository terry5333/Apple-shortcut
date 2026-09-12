import { NextResponse } from 'next/server';
import bplist from 'bplist-parser';

// 常用捷徑動作翻譯字典
const ACTION_DICTIONARY = {
  'gettext': '取得文字',
  'setvariable': '設定變數',
  'getvariable': '取得變數',
  'showresult': '顯示結果',
  'choosefrommenu': '從選單選擇',
  'conditional': '如果 (If 條件)',
  'ask': '要求輸入',
  'showalert': '顯示提示',
  'url': 'URL',
  'downloadurl': '取得 URL 內容',
  'setclipboard': '拷貝至剪貼板',
  'openurl': '打開 URL',
  'dictionary': '字典',
  'getvalueforkey': '取得字典的值',
  'math': '計算',
  'count': '計數',
  'runworkflow': '執行捷徑',
  'list': '列表',
  'getitemfromlist': '從列表中取得項目',
  'choosefromlist': '從列表中選擇',
  'base64encode': 'Base64 編碼',
  'notification': '顯示通知',
  'vibrate': '震動裝置',
  'waittoreturn': '等待返回',
  'delay': '等待',
  'comment': '註解',
  'text.match': '匹配文字',
  'text.replace': '取代文字',
  'text.split': '分割文字',
  'text.combine': '合併文字',
  'format.date': '格式化日期',
  'date': '日期',
  'nothing': '沒有任何內容'
};

// 處理未知 ID 的優化函數
function translateAction(identifier) {
  // 清除 Apple 官方前綴
  let cleanId = identifier.replace('is.workflow.actions.', '');
  
  // 1. 如果在字典內，直接回傳中文
  if (ACTION_DICTIONARY[cleanId]) {
    return ACTION_DICTIONARY[cleanId];
  }
  
  // 2. 如果是第三方 App (例如 com.apple.mobiletimer.CreateAlarm)
  // 則嘗試抓取最後一個單字作為名稱
  if (cleanId.includes('.')) {
    const parts = cleanId.split('.');
    return parts[parts.length - 1]; 
  }
  
  // 3. 都沒有的話，回傳原本的 ID
  return cleanId;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: '請提供捷徑 ID' }, { status: 400 });

  try {
    const metaRes = await fetch(`https://www.icloud.com/shortcuts/api/records/${id}`);
    if (!metaRes.ok) throw new Error('找不到該捷徑，請確認連結是否正確');
    const metadata = await metaRes.json();

    const shortcutName = metadata.fields.name.value;
    const downloadUrl = metadata.fields.shortcut.value.downloadURL;

    const fileRes = await fetch(downloadUrl);
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedData = await bplist.parseBuffer(buffer);
    const plistObject = parsedData[0]; 

    const rawActions = plistObject.WFWorkflowActions || [];
    const actions = rawActions.map((action, index) => {
      const rawId = action.WFWorkflowActionIdentifier;
      return {
        step: index + 1,
        rawId: rawId,
        // 加入翻譯過的好讀名稱
        displayName: translateAction(rawId),
        parameters: action.WFWorkflowActionParameters || {}
      };
    });

    return NextResponse.json({
      name: shortcutName,
      actionCount: actions.length,
      actions: actions
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || '解析失敗' }, { status: 500 });
  }
}
