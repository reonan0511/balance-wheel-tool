import { useState, useEffect, type JSX } from 'react';
import { track } from '@vercel/analytics';

const STORAGE_KEY = 'metamentor-balance-wheel-v1';

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
    if (newCategoryName.trim() !== '') {
      setCategories([
        ...categories,
        { name: newCategoryName.trim(), currentScore: 5, idealScore: 8 },
      ]);
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const removeCategory = (index: number) => {
    if (categories.length > 3) {
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

  const renderLabels = () => {
    return categories.map((category, index) => {
      const angle = (2 * Math.PI * index) / categories.length - Math.PI / 2;
      const labelDistance = radius + 25;
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
          fontSize="13"
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
          <a href="https://metamentor.tech/" target="_blank" rel="noopener noreferrer">
            <img
              src="/metamentor-logo.png"
              alt="MetaMentor"
              className="h-8 md:h-10"
            />
          </a>
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
        {/* タイトル（通常時） */}
        <div className="mb-6 print:hidden">
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

        {/* 印刷時ヘッダー */}
        <div className="hidden print:block mb-6 text-center border-b border-slate-400 pb-4">
          <h2 className="text-2xl font-bold">
            {name ? `${name} さんのバランスホイール` : 'バランスホイール'}
          </h2>
          <p className="text-sm mt-1">{formatDateJa(date)} 記入</p>
        </div>

        {/* 名前 + 日付 */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm print:hidden">
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
          <div className="flex items-center justify-center gap-4 mb-3 text-sm print:hidden">
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
              viewBox={`0 0 ${width} ${height}`}
              className="w-full max-w-md h-auto"
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

        {/* スコア入力（編集UI、印刷時非表示） */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm print:hidden">
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
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 text-sm text-brand-navy hover:underline"
            >
              + 領域を追加
            </button>
          )}
        </div>

        {/* 印刷時スコア表 */}
        <div className="hidden print:block mb-6">
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
          <p className="text-xs text-slate-500 mb-2 print:hidden">
            現在と理想の差が大きい項目について感じたこと、変えたいことを書き留めましょう
          </p>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例: 仕事と心の充実のギャップが大きい。週末に意識的に休む時間を作りたい..."
            className="w-full border border-slate-300 rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-navy print:border-slate-300 print:bg-transparent"
          />
        </div>

        {/* 完了導線 */}
        <div className="bg-brand-navy text-white rounded-lg p-5 mb-6 print:hidden">
          <h3 className="text-lg font-bold mb-3">
            ✨ 入力できたら、コーチに共有しましょう
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">📱 スマホの方</p>
              <p className="text-slate-200">
                スクリーンショットを撮ってコーチに送ってください
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">🖨 PCの方</p>
              <p className="text-slate-200 mb-2">
                印刷ボタンから PDF として保存・送信できます
              </p>
              <button
                onClick={handlePrint}
                className="bg-white text-brand-navy px-4 py-2 rounded font-medium hover:bg-slate-100 text-sm"
              >
                印刷 / PDF保存
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-4">
            入力内容はこの端末のブラウザに自動保存されます。次回開いた時に続きから記入できます。
          </p>
          <button
            onClick={handleClear}
            className="text-xs text-slate-300 hover:text-white underline mt-2"
          >
            入力をすべてクリアする
          </button>
        </div>

        {/* コーチ向けCTA */}
        <div className="bg-white rounded-lg p-5 shadow-sm print:hidden">
          <h3 className="text-base font-semibold text-brand-navy mb-1">
            コーチの方へ
          </h3>
          <p className="text-sm text-slate-700 mb-4">
            バランスホイール以外にも、コーチの「現場をもっと楽に」を支える
            <span className="text-brand-coral font-bold text-base">無料</span>
            のツールを揃えています。気になるものがあればぜひ。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href="https://metamentor.tech/product/crm/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('cta_click', { product: 'crm' })}
              className="block border border-slate-200 rounded-lg p-4 hover:border-brand-navy hover:shadow-md transition group"
            >
              <div className="text-2xl mb-2">🧰</div>
              <div className="font-bold text-sm text-brand-navy mb-1">
                MetaMentor CRM × AI
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                「記録に追われる夜」を終わらせる、AI搭載のコーチ向けCRM
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
                予約・契約・決済の事務作業を自動化、本業のセッションに時間を戻す
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
                クライアントに渡せる、5分で個人・組織の状態を可視化する無料診断
              </div>
              <div className="text-xs text-brand-coral font-semibold mt-3 group-hover:translate-x-1 transition">
                無料で診断する →
              </div>
            </a>
          </div>
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
