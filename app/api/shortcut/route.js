import { NextResponse } from 'next/server';
import bplist from 'bplist-parser';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: '請提供捷徑 ID' }, { status: 400 });
  }

  try {
    // 1. 取得捷徑 Metadata
    const metaRes = await fetch(`https://www.icloud.com/shortcuts/api/records/${id}`);
    if (!metaRes.ok) throw new Error('找不到該捷徑，請確認連結是否正確');
    const metadata = await metaRes.json();

    const shortcutName = metadata.fields.name.value;
    const downloadUrl = metadata.fields.shortcut.value.downloadURL;

    // 2. 下載 .shortcut 檔案 (將 ArrayBuffer 轉為 Node.js 支援的 Buffer)
    const fileRes = await fetch(downloadUrl);
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. 解析 bplist 檔案
    const parsedData = await bplist.parseBuffer(buffer);
    const plistObject = parsedData[0]; 

    // 4. 整理動作清單並清理前綴
    const rawActions = plistObject.WFWorkflowActions || [];
    const actions = rawActions.map((action, index) => ({
      step: index + 1,
      identifier: action.WFWorkflowActionIdentifier.replace('is.workflow.actions.', ''),
      parameters: action.WFWorkflowActionParameters || {}
    }));

    return NextResponse.json({
      name: shortcutName,
      actionCount: actions.length,
      actions: actions
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || '解析失敗，檔案可能已失效' }, { status: 500 });
  }
}

