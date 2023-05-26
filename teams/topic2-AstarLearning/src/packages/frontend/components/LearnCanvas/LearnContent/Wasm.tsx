import ReactMarkdown from "react-markdown";
import rehypeHighlight from 'rehype-highlight'

/**
 * Wasm Component
 * @returns 
 */
const Wasm = () => {

    return (
        <div>
            <h2 id="wasmとは" className="underline">WASMとは</h2>
            <p>WebAssembly のコードを実行できる環境のこと。</p>
            <h3 id="webassembly-とは" className="underline">WebAssembly とは</h3>
            <p>WebAssembly はブラウザで JavaScript 以外の言語を実行するための技術で、Rust などで書いたものをバイナリコードに変換して、ブラウザで実行できる技術です。</p>
            <p>スタックベース仮想マシン用のバイナリフォーマットの実行環境。仮想マシン用の ISA。どんな物理マシンでも(つまり OS に依存しない)動くこと。W3C 勧告。Mozira や Google なども開発している。</p>
            <h3 id="バイナリ・フォーマットとは" className="underline">バイナリ・フォーマットとは</h3>
            <p>テキストフォーマットのように、特定の環境に依存することなく、テキストエディタでデータを読み書きすることはできないが、代わりにデータの記録方式はプログラムで任意に決定できるため、情報を効率よく構造化することが可能になる。</p>
            <h3 id="wasiwebassembly-system-interfaceとは" className="underline">WASI(WebAssembly System Interface)とは</h3>
            <p>ブロックチェーンで使われている WebAssembly Runtime を紹介する前に、Web 以外で WebAssembly を利用するための標準化の取り組みである WASI について紹介します。</p>
            <p>WASI は WebAssembly System Interface のことで、WebAssembly をブラウザ以外の環境で実行するため、ホストのファイルシステムやネットワークなどの OS 機能へのアクセスを提供するための仕様です。W3C が勧告している。</p>
            <h3 id="なぜスマートコントラクトにwebassemblyを対応するのか？" className="underline">なぜスマートコントラクトにWebAssemblyを対応するのか？</h3>
            <ul className="list-disc">
                <li>1. 高いパフォーマンス。プラットフォームに依存せず、可能な限りネイティブなマシンコードに近づけるよう構築されています。</li>
                <li>2. 小さなサイズ。小さなバイナリで、インターネット接続が遅いデバイスにインターネット経由で配布することができます。これは、スペースに制約のあるブロックチェーンの世界には最適です。</li>
                <li>3. 一般的なVM&バイトコード どのブラウザでも同じ結果でコードをデプロイできるように開発されました。EVMとは異なり、特定のユースケースに向けて開発されていないため、多くのツールが利用可能で、大企業がWasmの開発促進に多くのリソースを投入しているという利点があります。<br/>
                効率的なJIT実行 CPUの命令と一対一に対応する64ビットと32ビットの整数演算をサポート。</li>
                <li>4. ミニマリズム。1ページに収まる形式的な仕様。</li>
                <li>5. 決定論的実行 コンセンサスアルゴリズムに必要な浮動小数点演算を削除することで、Wasmを容易に決定論的にすることができます。</li>
                <li>6. オープンスタンダード＞カスタムソリューション。WasmはGoogle、Mozillaなどを含むW3Cワークグループが開発したウェブブラウザの標準です。Wasmには、コンパイラと標準化チームの両方が何年もかけて取り組んできた。</li>
                <li>7. 多くの言語が利用可能です。Wasmは、スマートコントラクトの開発者が利用できる言語ファミリーを拡大し、Rust、C/C++、C#、Typescript、Haxe、Kotlinを含む。つまり、スマートコントラクトは、使い慣れたどの言語でも記述することができます。</li>
                <li>8. メモリセーフ、サンドボックス化、プラットフォーム非依存。</li>
                <li>9. LLVMのサポート。LLVMコンパイラーインフラストラクチャープロジェクトにサポートされているため、Wasmは10年以上にわたるLLVMのコンパイラー最適化の恩恵を受けています。</li>
                <li>10. 大企業が関与 Google、Apple、Microsoft、Mozilla、Facebookなどの大手企業によって継続的に開発されています。</li>
            </ul>
            <h3 id="astarにおけるwasmコントラクト開発言語" className="underline">AstarにおけるWASMコントラクト開発言語</h3>
            <p>現在は以下の通り</p>
            <ul className="list-disc">
                <li>!ink</li>
                <li>!ask</li>
            </ul>
            <h3 id="astarにおけるwasmコントラクトの開発フレームワーク" className="underline">AstarにおけるWASMコントラクトの開発フレームワーク</h3>
            <p>現在は、以下の通り</p>
            <ul className="list-disc">
                <li>swanky</li>
            </ul>
        </div>
    );
};

export default Wasm;