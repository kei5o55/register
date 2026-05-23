import type { Item,  Sale,Event,Bundle,} from "./types";

export const initialItems: Item[] = [//仮データ
    { id: "1", name: "新刊 A", price: 500, stock: 20 },
    { id: "2", name: "既刊 B", price: 700, stock: 15 },
    { id: "3", name: "グッズ C", price: 300, stock: 30 },
    { id: "4", name: "新刊 創作小説B6", price: 600, stock: 25 },
    { id: "5", name: "新作アクキー", price: 400, stock: 15 },
];  

export const initialBundles: Bundle[] = [//仮データ
    {
        id: "b1",
        name: "全部セット",
        price: 1500, // 単品合計よりちょっと安い価格設定
        lines: [
            { itemId: "1", quantity: 1 },
            { itemId: "2", quantity: 1 },
            { itemId: "3", quantity: 1 }
        ]
        },
        {
        id: "b2",
        name: "新刊＋グッズセット",
        price: 700, // 単品合計よりちょっと安い価格設定
        lines: [
            { itemId: "1", quantity: 1 },
            { itemId: "3", quantity: 1 }
        ]
    }
];

export const initialEvents: Event[] = [{//仮データ
    id: "e1",
    name: "sample即売イベントvol.1000",
    date: "20xx-2-2",
    memo: "同人即売イベント"
},
{
    id: "e2",
    name: "あおぞら創作オンリー2026",
    date: "2026-05-24",
    memo: "地方都市での創作オンリーイベント。のんびりだけど熱量高め"
  }
];

export const initialSales: Sale[] = [
  // 【11:00〜11:30：開場直後のスタートダッシュ】
  // サークル目当ての人が、迷わず「全部セット」を1個買って爆速で去っていく時間帯
  {
    id: "1",
    datetime: "2026-05-22T11:05:12.345+09:00",
    total: 1500, 
    items: [],
    bundles: [{ bundleId: "b1", name: "全部セット", quantity: 1 }],
    bundleExpandedItems: [
      { itemId: "1", name: "新刊 A", quantity: 1 },
      { itemId: "2", name: "既刊 B", quantity: 1 },
      { itemId: "3", name: "グッズ C", quantity: 1 }
    ],
    eventId: "e1",
  },
  {
    id: "2",
    datetime: "2026-05-22T11:14:45.000+09:00",
    total: 1500, 
    items: [],
    bundles: [{ bundleId: "b1", name: "全部セット", quantity: 1 }],
    bundleExpandedItems: [
      { itemId: "1", name: "新刊 A", quantity: 1 },
      { itemId: "2", name: "既刊 B", quantity: 1 },
      { itemId: "3", name: "グッズ C", quantity: 1 }
    ],
    eventId: "e1",
  },
  {
    id: "3",
    datetime: "2026-05-22T11:28:31.904+09:00",
    total: 700, // 新刊＋グッズセット
    items: [],
    bundles: [{ bundleId: "b2", name: "新刊＋グッズセット", quantity: 1 }],
    bundleExpandedItems: [
      { itemId: "1", name: "新刊 A", quantity: 1 },
      { itemId: "3", name: "グッズ C", quantity: 1 }
    ],
    eventId: "e1",
  },

  // 【11:30〜12:30：混雑のピークタイム】
  // 島中を巡回している一般参加者が流入。新刊単品や、お土産用の「新刊2冊」が発生しやすい
  {
    id: "4",
    datetime: "2026-05-22T11:45:22.123+09:00",
    total: 500, // 新刊A 単品1冊
    items: [{ itemId: "1", name: "新刊 A", price: 500, quantity: 1 }],
    eventId: "e1",
  },
  {
    id: "5",
    datetime: "2026-05-22T12:02:14.567+09:00",
    total: 1000, // 【リアル枠】頼まれもの等で新刊を2冊買うパターン
    items: [{ itemId: "1", name: "新刊 A", price: 500, quantity: 2 }],
    eventId: "e1",
  },
  {
    id: "6",
    datetime: "2026-05-22T12:20:08.789+09:00",
    total: 1500, // 全部セット
    items: [],
    bundles: [{ bundleId: "b1", name: "全部セット", quantity: 1 }],
    bundleExpandedItems: [
      { itemId: "1", name: "新刊 A", quantity: 1 },
      { itemId: "2", name: "既刊 B", quantity: 1 },
      { itemId: "3", name: "グッズ C", quantity: 1 }
    ],
    eventId: "e1",
  },

  // 【12:30〜13:30：まったり巡回タイム】
  // 見本誌を読んで気になった人が単品で買ったり、セットの手持ちがない人が組み合わせで買う
  {
    id: "7",
    datetime: "2026-05-22T12:45:43.045+09:00",
    total: 1200, // 新刊A(500) + 既刊B(700) を単品で組み合わせ
    items: [
      { itemId: "1", name: "新刊 A", price: 500, quantity: 1 },
      { itemId: "2", name: "既刊 B", price: 700, quantity: 1 }
    ],
    eventId: "e1",
  },
  {
    id: "8",
    datetime: "2026-05-22T13:09:11.234+09:00",
    total: 500, // 新刊A 単品1冊
    items: [{ itemId: "1", name: "新刊 A", price: 500, quantity: 1 }],
    eventId: "e1",
  },

  // 【13:30〜14:30：イベント終盤・撤収前の滑り込み】
  // 小銭消費でグッズだけ買われたり、完売が出始めてセットが崩れ、残った既刊がぽつぽつ売れる
  {
    id: "9",
    datetime: "2026-05-22T13:42:50.612+09:00",
    total: 300, // グッズC 単品1個（小銭で買えるやつ）
    items: [{ itemId: "3", name: "グッズ C", price: 300, quantity: 1 }],
    eventId: "e1",
  },
  {
    id: "10",
    datetime: "2026-05-22T14:15:19.812+09:00",
    total: 700, // 既刊B 単品1冊（新刊が完売した後に既刊が動くリアル）
    items: [{ itemId: "2", name: "既刊 B", price: 700, quantity: 1 }],
    eventId: "e1",
  },
  {
      id: "11",
      datetime: "2026-05-24T11:04:15.123+09:00",
      total: 600, 
      items: [{ itemId: "4", name: "新刊 創作小説B6", price: 600, quantity: 1 }],
      eventId: "e2",
    },
    {
      id: "12",
      datetime: "2026-05-24T11:15:30.000+09:00",
      total: 600,
      items: [{ itemId: "4", name: "新刊 創作小説B6", price: 600, quantity: 1 }],
      eventId: "e2",
    },
    {
      id: "13",
      datetime: "2026-05-24T11:32:08.555+09:00",
      total: 1000, // 「新刊とアクキー両方ください」のセット買いパターン
      items: [
        { itemId: "4", name: "新刊 創作小説B6", price: 600, quantity: 1 },
        { itemId: "5", name: "新作アクキー", price: 400, quantity: 1 }
      ],
      eventId: "e2",
    },

    // 【12:00〜13:15：お昼のまったり巡回タイム】
    // 会場をのんびり歩いている人が、表紙やPOPに惹かれて足を止めてくれる時間帯
    {
      id: "14",
      datetime: "2026-05-24T12:08:42.234+09:00",
      total: 600, // 新刊 1冊
      items: [{ itemId: "4", name: "新刊 創作小説B6", price: 600, quantity: 1 }],
      eventId: "e2",
    },
    {
      id: "15",
      datetime: "2026-05-24T12:45:19.888+09:00",
      total: 1000, // 新刊＋アクキーを同時購入
      items: [
        { itemId: "4", name: "新刊 創作小説B6", price: 600, quantity: 1 },
        { itemId: "5", name: "新作アクキー", price: 400, quantity: 1 }
      ],
      eventId: "e2",
    },
    {
      id: "16",
      datetime: "2026-05-24T13:10:05.111+09:00",
      total: 400, // 「アクキー可愛い！」とグッズ単品で買っていく人
      items: [{ itemId: "5", name: "新作アクキー", price: 400, quantity: 1 }],
      eventId: "e2",
    },

    // 【13:30〜15:00：イベント終盤・撤収前の滑り込み】
    // 小銭が余った一般参加者や、売り子終了後にお買い物に回ってきた隣のサークルさん
    {
      id: "17",
      datetime: "2026-05-24T13:50:22.456+09:00",
      total: 400, // 新作アクキー 1個
      items: [{ itemId: "5", name: "新作アクキー", price: 400, quantity: 1 }],
      eventId: "e2",
    },
    {
      id: "18",
      datetime: "2026-05-24T14:12:33.999+09:00",
      total: 600, // 最後の最後に滑り込みで新刊が1冊
      items: [{ itemId: "4", name: "新刊 創作小説B6", price: 600, quantity: 1 }],
      eventId: "e2",
    }
];