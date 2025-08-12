# RTE Survey

Next.js(App Router, TypeScript) と Chakra UI を用いた、リッチテキストエディタの各種ライブラリの比較検証用リポジトリ。

## 技術スタック
- Next.js 15 (App Router, TypeScript)
- React 19
- Chakra UI 3 (`@chakra-ui/react`)

## セットアップ
```bash
npm i
npm run dev
```

開発サーバ: `http://localhost:3000`

## TinyMCE の API キー設定
- TinyMCE は API キーが必須です。
- ローカル開発: プロジェクト直下で `.env.example` を `.env.local` にコピーし、値を設定。
  - macOS/Linux: `cp .env.example .env.local`
  - Windows (PowerShell): `copy .env.example .env.local`
  - 設定後、以下の環境変数を `.env.local` に記載。
  - `NEXT_PUBLIC_TINYMCE_API_KEY=あなたのAPIキー`
- 実行時参照: `src/app/editors/tinymce/page.tsx` は上記環境変数を参照します。
- 本番/CI: デプロイ先の環境変数として同名キーを設定してください。
- 反映: 変更後は `npm run dev` を再起動。
- 注意: API キーをレポジトリにコミットしないこと（`.env.local` は未管理）。

## 比較対象

| ライブラリ | 特徴 | 他にはない特徴的な機能 | Reactとの親和性とコーディングしやすさ | メリット | デメリット |
|:--|:--|:--|:--|:--|:--|
| TipTap | ProseMirror基盤。拡張豊富なヘッドレスエディタ／標準出力: ProseMirror JSON | ヘッドレス設計でUIを自由設計可能 | 非常に高い親和性。Reactでラップ容易、ドキュメント充実 | 柔軟・拡張豊富・MD拡張あり | 一部高度機能は有償、ProseMirror知識が要る |
| Lexical | Meta製。高速・堅牢。ノード拡張で柔軟に表現／標準出力: Lexical State(JSON) | 共同編集をコアで支援。状態/同期を標準化 | 非常に高い親和性。Hooks中心で拡張容易 | 型が強く拡張しやすい・共同編集に親和 | 公式UIが少なく、設計理解が必要。現状のバージョンが0系。状態JSONの長期互換は限定的 |
| Quill | Deltaモデル採用。軽量で導入容易な成熟RTE／標準出力: Delta | Deltaで変更履歴を効率管理 | 高い親和性。ラッパー多数（要API学習） | 安定・導入容易 | React19対応が保守的、MDは外部拡張。react-quillはReact19非対応(2025/08/08) |
| TinyMCE | 充実UI/プラグイン。即戦力のフル機能エディタ／標準出力: HTML | Wordライクな豊富UIと公式プラグイン群 | 高い親和性。公式Reactコンポーネント提供 | すぐ使えるUI・企業実績 | 一部機能は商用、バンドルやや重い。APIキー必須。標準はHTMLでJSONはプラグイン/自前変換が必要 |
| Slate | 完全カスタム志向。低レベルAPIで柔軟に構築／標準出力: JSONツリー(Descendant[]) | 低レベルAPIで特殊挙動/構造を自由実装 | 中程度。自作箇所多く難易度高 | 完全カスタムに最適 | 実装コスト高、学習コスト高。データ互換性は実装責務 |

### デモ
- `/editors` に一覧と各サンプルへのリンクを用意

## 出力形式（標準）
- Quill: Delta（ドキュメント状態/変更表現のためのフォーマット）
- Lexical: EditorState の JSON（`toJSON()`、長期互換は限定的）
- TipTap: ProseMirror 互換 JSON（`editor.getJSON()`）
- TinyMCE: HTML（デフォルト）。JSON/Markdownはプラグインや自前変換で対応
- Slate: JSONツリー（`Descendant[]`。モデルはアプリ定義で互換は実装依存）
