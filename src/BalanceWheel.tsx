import { useState, useEffect, type JSX } from 'react';
import { track } from '@vercel/analytics';

const STORAGE_KEY = 'metamentor-balance-wheel-v1';
const MAX_CATEGORIES = 10;
const MIN_CATEGORIES = 3;

interface Category {
  name: string;
  currentScore: number;
  idealScore: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: '健康', currentScore: 5, idealScore: 8 },
  { name: '仕事・キャリア', currentScore: 5, idealScore: 8 },
  { name: '家族', currentScore: 5, idealScore: 8 },
  { name: '人間関係', currentScore: 5, idealScore: 8 },
  { name: '趣味・余暇', currentScore: 5, idealScore: 8 },
  { name: '自己成長', currentScore: 5, idealScore: 8 },
  { name: 'お金', currentScore: 5, idealScore: 8 },
  { name: '心の充実', currentScore: 5, idealScore: 8 },
];

const COLORS = [
  '#D4626C', // ローズ
  '#C57C77', // テラコッタ
  '#C99672', // アンバー
  '#9DBA6A', // セージ
  '#6FB89A', // シーフォーム
  '#7E89C5', // ペリウィンクル
  '#D4805F', // コーラル
  '#C9434F', // ラズベリー
  '#A87FA0', // モーブ
  '#7BA6C9', // スカイブルー
];

const todayString = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const formatDateJa = (iso: string): string => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  return `${match[1]}年${parseInt(match[2], 10)}月${parseInt(match[3], 10)}日`;
};

export default function BalanceWheel() {
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayString());
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [memo, setMemo] = useState('');
  const [showIdeal, setShowIdeal] = useState(true);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [shareMode, setShareMode] = useState(false);

  const enterShareMode = () => {
    track('share_mode_enter');
    setShareMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitShareMode = () => {
    setShareMode(false);
  };

  // LocalStorage 復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved.name === 'string') setName(saved.name);
        if (typeof saved.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(saved.date)) {
          setDate(saved.date);
        }
        if (Array.isArray(saved.categories) && saved.categories.length >= 3) {
          setCategories(saved.categories);
        }
        if (typeof saved.memo === 'string') setMemo(saved.memo);
        if (typeof saved.showIdeal === 'boolean') setShowIdeal(saved.showIdeal);
      }
    } catch {
      // 復元失敗時はデフォルトのまま
    }
    setHydrated(true);
  }, []);

  // LocalStorage 自動保存
  useEffect(() => {
    if (!hydrated) return;
    try {
      const state = { name, date, categories, memo, showIdeal };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 保存失敗時はサイレントに無視（ストレージ不可環境対応）
    }
  }, [name, date, categories, memo, showIdeal, hydrated]);

  const handleClear = () => {
    if (window.confirm('入力内容をすべてクリアします。よろしいですか?')) {
      setName('');
      setDate(todayString());
      setCategories(DEFAULT_CATEGORIES);
      setMemo('');
      setShowIdeal(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // 無視
      }
    }
  };

  const handlePrint = () => {
    track('print_clicked');
    window.print();
  };

  // SVG設定
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 50;
  const maxScore = 10;

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setNewCategoryName(categories[index].name);
  };

  const saveCategory = () => {
    if (newCategoryName.trim() !== '' && editingIndex !== null) {
      const updated = [...categories];
      updated[editingIndex] = { ...updated[editingIndex], name: newCategoryName.trim() };
      setCategories(updated);
    }
    setEditingIndex(null);
  };

  const addCategory = () => {
    if (newCategoryName.trim() === '') return;
    if (categories.length >= MAX_CATEGORIES) return;
    setCategories([
      ...categories,
      { name: newCategoryName.trim(), currentScore: 5, idealScore: 8 },
    ]);
    setNewCategoryName('');
    setIsAdding(false);
  };

  const removeCategory = (index: number) => {
    if (categories.length > MIN_CATEGORIES) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleScoreChange = (
    index: number,
    type: 'current' | 'ideal',
    newScore: string
  ) => {
    const updated = [...categories];
    const value = parseInt(newScore, 10);
    if (type === 'current') {
      updated[index] = { ...updated[index], currentScore: value };
    } else {
      updated[index] = { ...updated[index], idealScore: value };
    }
    setCategories(updated);
  };

  const getCoordinates = (index: number, score: number) => {
    const angle = (2 * Math.PI * index) / categories.length - Math.PI / 2;
    const distance = (radius * score) / maxScore;
    return {
      x: centerX + distance * Math.cos(angle),
      y: centerY + distance * Math.sin(angle),
    };
  };

  const generatePolygonPoints = (type: 'current' | 'ideal') => {
    return categories
      .map((cat, index) => {
        const score = type === 'current' ? cat.currentScore : cat.idealScore;
        const { x, y } = getCoordinates(index, score);
        return `${x},${y}`;
      })
      .join(' ');
  };

  const renderScaleLines = () => {
    const lines: JSX.Element[] = [];
    for (let i = 1; i <= maxScore; i++) {
      const r = (radius * i) / maxScore;
      lines.push(
        <circle
          key={`circle-${i}`}
          cx={centerX}
          cy={centerY}
          r={r}
          fill="none"
          stroke="#ddd"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      );
    }
    categories.forEach((_, index) => {
      const angle = (2 * Math.PI * index) / categories.length - Math.PI / 2;
      const x2 = centerX + radius * Math.cos(angle);
      const y2 = centerY + radius * Math.sin(angle);
      lines.push(
        <line
          key={`line-${index}`}
          x1={centerX}
          y1={centerY}
          x2={x2}
          y2={y2}
          stroke="#ddd"
          strokeWidth="1"
        />
      );
    });
    return lines;
  };

  // 項目数に応じてフォントサイズを動的に
  const labelFontSize = categories.length <= 8 ? 13 : categories.length === 9 ? 12 : 11;

  const renderLabels = () => {
    return categories.map((category, index) => {
      const angle = (2 * Math.PI * index) / categories.length - Math.PI / 2;
      const labelDistance = radius + 22;
      const x = centerX + labelDistance * Math.cos(angle);
      const y = centerY + labelDistance * Math.sin(angle);
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (Math.cos(angle) > 0.5) textAnchor = 'start';
      else if (Math.cos(angle) < -0.5) textAnchor = 'end';
      let dy = '0.3em';
      if (Math.sin(angle) > 0.8) dy = '0.8em';
      else if (Math.sin(angle) < -0.8) dy = '-0.2em';
      return (
        <text
          key={`label-${index}`}
          x={x}
          y={y}
          textAnchor={textAnchor}
          dy={dy}
          fontSize={labelFontSize}
          fontWeight="bold"
          fill="#444"
        >
          {category.name}
        </text>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src="/metamentor-logo.png"
            alt="MetaMentor"
            className="h-8 md:h-10"
          />
          <a
            href="https://metamentor.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-slate-600 hover:text-brand-navy"
          >
            MetaMentor について →
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* シェア表示モードバナー */}
        {shareMode && (
          <div className="bg-brand-coral text-white rounded-lg px-4 py-2 mb-4 flex items-center justify-between print:hidden">
            <button
              onClick={exitShareMode}
              className="text-sm font-medium hover:underline flex items-center gap-1"
            >
              ← 編集に戻る
            </button>
            <span className="text-xs">
              📤 シェア表示中（このままスクショして送れます）
            </span>
          </div>
        )}

        {/* タイトル（通常時、シェア時は非表示） */}
        <div className={`mb-6 print:hidden ${shareMode ? 'hidden' : ''}`}>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">
              人生の輪（バランスホイール）
            </h1>
            <p className="text-sm text-slate-600 mb-3">
              今のあなたを8つの領域で見える化しましょう
            </p>
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="text-xs text-brand-navy hover:underline inline-flex items-center gap-1"
              aria-expanded={showAbout}
            >
              <span>バランスホイールとは?</span>
              <span
                className={`transition-transform inline-block ${showAbout ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
          </div>
          {showAbout && (
            <div className="mt-3 max-w-2xl mx-auto bg-white rounded-lg p-5 text-left text-sm text-slate-700 shadow-sm border border-slate-200">
              <h2 className="font-bold text-brand-navy mb-2">
                バランスホイールとは?
              </h2>
              <p className="leading-relaxed mb-4">
                人生を構成する複数の領域を円のかたちに並べ、それぞれの満足度を点数化することで、今のバランスを一目で見える化するツールです。コーチングの現場で長年使われてきた、対話の入り口になる定番ワークです。
              </p>
              <h3 className="font-bold text-brand-navy mb-2">
                なぜ「輪」なのか?
              </h3>
              <p className="leading-relaxed mb-4">
                車輪は、形が真円に近いほどスムーズに転がります。どこか一つでも極端にへこんでいれば、ガタガタと進んでしまう。人生も同じで、一部の領域だけ頑張っても他が弱いと前に進みづらくなります。
              </p>
              <h3 className="font-bold text-brand-navy mb-2">使い方のコツ</h3>
              <ul className="leading-relaxed list-disc list-inside space-y-1">
                <li>「現在」と「理想」の差が大きい領域に注目してみましょう</li>
                <li>「思っていたより低い / 高い」と感じた領域はありますか?</li>
                <li>数値そのものより、書きながら浮かんだ気づきを大切に</li>
                <li>完璧を目指さず、今日感じたままで OK です</li>
              </ul>
            </div>
          )}
        </div>

        {/* 印刷 / シェア時ヘッダー */}
        <div className={`mb-6 text-center border-b border-slate-400 pb-4 ${shareMode ? 'block' : 'hidden print:block'}`}>
          <h2 className="text-2xl font-bold">
            {name ? `${name} さんのバランスホイール` : 'バランスホイール'}
          </h2>
          <p className="text-sm mt-1">{formatDateJa(date)} 記入</p>
        </div>

        {/* 名前 + 日付（シェア時非表示、ヘッダーで代替） */}
        <div className={`bg-white rounded-lg p-4 mb-4 shadow-sm print:hidden ${shareMode ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                お名前 <span className="text-xs text-slate-500">（任意・コーチに共有時に役立ちます）</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 山田 太郎"
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                記入日 <span className="text-xs text-slate-500">（いつの自分かを記録）</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-navy"
              />
            </div>
          </div>
        </div>

        {/* チャート */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className={`flex items-center justify-center gap-4 mb-3 text-sm print:hidden ${shareMode ? 'hidden' : ''}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showIdeal}
                onChange={() => setShowIdeal(!showIdeal)}
                className="w-4 h-4"
              />
              <span>理想の状態を表示</span>
            </label>
          </div>

          <div className="flex items-center justify-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: '#EE4D5E' }}
              />
              <span>現在</span>
            </div>
            {showIdeal && (
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-300" />
                <span>理想</span>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <svg
              viewBox={`-50 -30 ${width + 100} ${height + 60}`}
              className={`balance-chart-svg w-full h-auto ${shareMode ? 'max-w-xs' : 'max-w-md'}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {renderScaleLines()}
              {showIdeal && (
                <polygon
                  points={generatePolygonPoints('ideal')}
                  fill="rgba(173, 216, 230, 0.3)"
                  stroke="#90CDF4"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                />
              )}
              <polygon
                points={generatePolygonPoints('current')}
                fill="rgba(238, 77, 94, 0.25)"
                stroke="#EE4D5E"
                strokeWidth="2"
              />
              {categories.map((cat, index) => {
                const { x, y } = getCoordinates(index, cat.currentScore);
                return (
                  <circle
                    key={`current-pt-${index}`}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              })}
              {showIdeal &&
                categories.map((cat, index) => {
                  const { x, y } = getCoordinates(index, cat.idealScore);
                  return (
                    <circle
                      key={`ideal-pt-${index}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#90CDF4"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeDasharray="2,1"
                    />
                  );
                })}
              {renderLabels()}
              <circle cx={centerX} cy={centerY} r="3" fill="#555" />
            </svg>
          </div>
        </div>

        {/* スコア入力（編集UI、印刷・シェア時非表示） */}
        <div className={`bg-white rounded-lg p-4 mb-4 shadow-sm print:hidden ${shareMode ? 'hidden' : ''}`}>
          <h3 className="text-lg font-semibold text-brand-navy mb-2">
            各領域のスコア設定
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            領域名をタップで編集 / スライダーでスコア調整 / × で削除（最低3項目）
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <div key={`cat-${index}`} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2 min-h-[28px]">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onBlur={saveCategory}
                      onKeyDown={(e) => e.key === 'Enter' && saveCategory()}
                      className="border border-slate-300 rounded px-2 py-1 text-sm w-full"
                      autoFocus
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(index)}
                        className="font-medium text-left text-slate-800 hover:text-brand-navy hover:underline flex items-center gap-2"
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          aria-hidden="true"
                        />
                        {cat.name}
                      </button>
                      {categories.length > 3 && (
                        <button
                          onClick={() => removeCategory(index)}
                          className="text-slate-400 hover:text-red-500 text-lg leading-none px-2"
                          aria-label={`${cat.name}を削除`}
                        >
                          ×
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center mb-2">
                  <span className="w-12 text-xs text-slate-600">現在:</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={cat.currentScore}
                    onChange={(e) => handleScoreChange(index, 'current', e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <span className="w-6 text-center text-sm font-medium">
                    {cat.currentScore}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-12 text-xs text-slate-600">理想:</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={cat.idealScore}
                    onChange={(e) => handleScoreChange(index, 'ideal', e.target.value)}
                    className="flex-1 mr-2"
                  />
                  <span className="w-6 text-center text-sm font-medium">
                    {cat.idealScore}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {isAdding ? (
            <div className="mt-4 flex gap-2 flex-wrap">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="新しい領域名"
                className="flex-1 border border-slate-300 rounded px-3 py-2 min-w-[200px]"
                autoFocus
              />
              <button
                onClick={addCategory}
                className="bg-brand-navy text-white px-4 py-2 rounded hover:opacity-90"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewCategoryName('');
                }}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300"
              >
                取消
              </button>
            </div>
          ) : categories.length < MAX_CATEGORIES ? (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setIsAdding(true)}
                className="text-sm text-brand-navy hover:underline"
              >
                + 領域を追加
              </button>
              <span className="text-xs text-slate-400">
                （あと {MAX_CATEGORIES - categories.length} 項目まで追加可）
              </span>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              ※ 最大 {MAX_CATEGORIES} 項目まで追加できます。これ以上追加するには、まず既存の項目を削除してください。
            </p>
          )}
        </div>

        {/* 印刷 / シェア時スコア表 */}
        <div className={`mb-6 ${shareMode ? 'block' : 'hidden print:block'}`}>
          <h3 className="text-lg font-semibold mb-2">スコア一覧</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-400">
                <th className="text-left py-2">領域</th>
                <th className="text-center py-2 w-20">現在</th>
                <th className="text-center py-2 w-20">理想</th>
                <th className="text-center py-2 w-20">差</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={`print-${index}`} className="border-b border-slate-200">
                  <td className="py-1.5">{cat.name}</td>
                  <td className="text-center">{cat.currentScore}</td>
                  <td className="text-center">{cat.idealScore}</td>
                  <td className="text-center">
                    {cat.idealScore - cat.currentScore > 0 ? '+' : ''}
                    {cat.idealScore - cat.currentScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 気づきメモ */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="text-lg font-semibold text-brand-navy mb-2 print:text-slate-800">
            気づきメモ
          </h3>
          <p className={`text-xs text-slate-500 mb-2 print:hidden ${shareMode ? 'hidden' : ''}`}>
            現在の数値を入れてみて感じたことや、理想との差が大きい項目について感じたこと、変えたいことを書き留めましょう
          </p>
          {shareMode ? (
            <div className="text-sm text-slate-700 whitespace-pre-wrap min-h-[60px] border border-slate-200 rounded px-3 py-2 bg-slate-50">
              {memo || <span className="text-slate-400 italic">（メモなし）</span>}
            </div>
          ) : (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: 仕事と心の充実のギャップが大きい。週末に意識的に休む時間を作りたい..."
              className="w-full border border-slate-300 rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-navy print:border-slate-300 print:bg-transparent"
            />
          )}
        </div>

        {/* シェア時専用: 末尾の編集に戻るボタン */}
        {shareMode && (
          <div className="text-center mb-6 print:hidden">
            <button
              onClick={exitShareMode}
              className="text-sm text-brand-navy hover:underline"
            >
              ← 編集に戻る
            </button>
          </div>
        )}

        {/* 完了導線（シェア時非表示） */}
        <div className={`bg-brand-navy text-white rounded-lg p-5 mb-6 print:hidden ${shareMode ? 'hidden' : ''}`}>
          <h3 className="text-lg font-bold mb-3">
            ✨ 入力できたら、コーチに共有しましょう
          </h3>

          {/* メイン: シェア表示ボタン */}
          <button
            onClick={enterShareMode}
            className="w-full bg-white text-brand-navy px-4 py-3 rounded-lg font-bold hover:bg-slate-100 mb-2 text-base shadow-md"
          >
            📤 シェア表示にする
          </button>
          <p className="text-xs text-slate-200 mb-4 leading-relaxed">
            編集UIを隠して結果だけ表示します。スマホ1スクリーンに収まるので、そのままスクショして送ってください。
          </p>

          {/* または: 別の保存方法 */}
          <div className="border-t border-blue-900 pt-3 text-sm">
            <p className="text-xs text-slate-300 mb-2">または、以下の方法でも保存できます：</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold mb-1">📱 そのままスクショ</p>
                <p className="text-xs text-slate-300">
                  画面が長いので複数枚に分かれることがあります
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">🖨 印刷 / PDFで保存（A4 1枚に収まります）</p>
                <button
                  onClick={handlePrint}
                  className="bg-white text-brand-navy px-3 py-1.5 rounded font-medium hover:bg-slate-100 text-xs"
                >
                  印刷 / PDF保存
                </button>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  <span className="font-semibold text-slate-200">スマホでも PDF 保存可能：</span>{' '}
                  上のボタン → プリンタ選択画面で「PDF として保存」または「共有 → ファイルに保存」を選ぶと、PDF として Files / ダウンロードに保存されます。
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-4 leading-relaxed">
            入力内容はこの端末のブラウザに自動保存されます。次回開いた時に続きから記入できます。<br />
            <span className="text-slate-400">
              ※ ただし、ブラウザのキャッシュ削除・シークレットモードでの利用・別の端末やブラウザでの閲覧では引き継がれません。大切な内容は印刷やスクリーンショットで保存しておくと安心です。
            </span>
          </p>
          <button
            onClick={handleClear}
            className="text-xs text-slate-300 hover:text-white underline mt-2"
          >
            入力をすべてクリアする
          </button>
        </div>

        {/* コーチ向けCTA（シェア時非表示） */}
        <div className={`bg-white rounded-lg p-5 shadow-sm print:hidden ${shareMode ? 'hidden' : ''}`}>
          <h3 className="text-base font-semibold text-brand-navy mb-1">
            コーチの方へ
          </h3>
          <p className="text-sm text-slate-700 mb-1">
            <span className="text-brand-navy font-bold">ICF認定PCCコーチが現場で使うために設計</span>した、コーチ業務を楽にする
            <span className="text-brand-coral font-bold text-base">無料</span>
            のツール群です。
          </p>
          <p className="text-xs text-slate-500 mb-4">
            気になるものがあればぜひ。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="https://metamentor.tech/product/crm/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('cta_click', { product: 'crm' })}
              className="block border border-slate-200 rounded-lg p-4 hover:border-brand-navy hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-bold text-sm text-brand-navy mb-1">
                コーチング AI
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                日本初のコーチングCRM × AI。セッション音声をアップするだけで、AIが<span className="font-semibold text-slate-700">文字起こし・要約・ICFのPCCマーカー分析</span>まで自動化。記録の手間から解放され、AIフィードバックで上達も加速。
              </div>
              <div className="text-xs text-brand-coral font-semibold mt-3 group-hover:translate-x-1 transition">
                無料で使ってみる →
              </div>
            </a>
            <a
              href="https://metamentor.tech/product/sm/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('cta_click', { product: 'session_manager' })}
              className="block border border-slate-200 rounded-lg p-4 hover:border-brand-navy hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-bold text-sm text-brand-navy mb-1">
                セッションマネージャー
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">予約管理・Zoom URL自動発行・カレンダー連携・セッション記録</span>までワンストップ。複数ツールを行き来する手作業から解放され、本業のコーチングに集中できる毎日へ。
              </div>
              <div className="text-xs text-brand-coral font-semibold mt-3 group-hover:translate-x-1 transition">
                無料で使ってみる →
              </div>
            </a>
            <a
              href="https://wellbeing.metamentor.tech/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('cta_click', { product: 'wellbeing_diagnosis' })}
              className="block border border-slate-200 rounded-lg p-4 hover:border-brand-navy hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">🌱</div>
              <div className="font-bold text-sm text-brand-navy mb-1">
                ウェルビーイング診断
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">クライアントの「今の状態」と「セッション前後の変化」を5分で可視化</span>。早稲田大学・大月友教授（臨床心理士）監修の25因子診断で、コーチング効果を客観データとして示せる。
              </div>
              <div className="text-xs text-brand-coral font-semibold mt-3 group-hover:translate-x-1 transition">
                無料で診断する →
              </div>
            </a>
          </div>
        </div>

        {/* マガジンCTA（シェア時非表示） */}
        <div className={`bg-white rounded-lg p-5 shadow-sm mt-4 print:hidden ${shareMode ? 'hidden' : ''}`}>
          <h3 className="text-base font-semibold text-brand-navy mb-1">
            もっと学ぶなら
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            対人支援の現場で役立つ実践記事を、ウェルビーイング マガジンで配信しています。
          </p>
          <a
            href="https://metamentor.tech/magazine/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('cta_click', { product: 'magazine' })}
            className="block border border-slate-200 rounded-lg p-4 hover:border-brand-navy hover:shadow-md transition group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">📖</div>
              <div className="flex-1">
                <div className="font-bold text-sm text-brand-navy mb-1">
                  WELLBEING MAGAZINE
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">最新論文の解説、ICF/PCC試験対策、現場の実践事例</span>まで。対人支援者向けに編集された記事を週次で更新、コーチとしての引き出しを増やすコンテンツを届けます。
                </div>
                <div className="text-xs text-brand-coral font-semibold mt-3 group-hover:translate-x-1 transition">
                  記事を読む →
                </div>
              </div>
            </div>
          </a>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-slate-200 mt-8 print:bg-transparent print:border-t print:border-slate-300 print:mt-4">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-slate-500">
          <p className="mb-2 print:hidden">
            <a
              href="https://metamentor.tech/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-navy underline"
            >
              お問い合わせ・バグ報告
            </a>
          </p>
          <p>
            Powered by{' '}
            <a
              href="https://metamentor.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-navy"
            >
              MetaMentor, Inc.
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
