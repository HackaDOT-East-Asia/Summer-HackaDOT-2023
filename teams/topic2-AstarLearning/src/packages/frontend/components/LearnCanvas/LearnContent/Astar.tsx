import React from "react";

/**
 * Astar Component
 * @returns 
 */
const Astar = ():JSX.Element => {
    
    return (
        <div>
            <h1 className='underline'>Astar Networkとは</h1>
            <ul className="list-disc">
                <li>
                    <p>Astar Network は日本発の Public Blockchain</p>
                </li>
                <li>
                    <p>Multichain Smart Contract Platform</p>
                </li>
            </ul>
            <div></div>
            <p>現在 EtheruemやBitcoinなどのLayer1 Blockchain が独立して多く存在し、インターネットにおけるイントラネットの状態を作り出してしまっており、相互接続が難しくなっている。</p>
            <p></p>
            <p>例:) Aチェーン上の処理をトリガーにBチェーン上の処理を実行させる。</p>
            <p>Astar Network は Multichain 時代において複数の Layer1 Blockchain を接続し、その上に アプリケーションを作成可能なプラットフォームを目指しているブロックチェーンです。</p>
            <div></div>
            <h3 className="underline">Astar Networkの特徴</h3>
            <ul className="list-disc">
                <li>
                    <p>Multichain Application</p>
                </li>
                <li>
                    <p>XVM</p>
                </li>
                <li>
                    <p>dapp staking</p>
                </li>
            </ul>
            <p>特にXVMの存在は大きく、XVM により、EVM と WebAssembly の両環境下でスマートコントラクトをデプロイ可能で、従来なら分かれてしまうエコシステムがインタラクティブに動作可能。</p>
            <p>WebAssembly対応のスマートコントラクト開発であれば、C++やRustなどの従来のプログラミング言語の技術を有しているエンジニアがWeb3の世界にも入って来やすいのでその点も良い。</p>
            <p>dApp Staking では、開発者のエコシステムへの貢献度により $ASTR が配られるように設計されている。もうすぐバージョン3の仕様に更新される予定。</p>
            <h3 className="underline">AstarNetworkはどんなところから支持を得ている?</h3>
            <p>多数のVCの他、web3 提唱者であり Ethereum、Polkadot の共同創業者の Gavin Wood や Parity の元 CEO であり Ethereum の元 Chief Security Officer である Jutta Steiner などから投資を受けている。</p>
            <h3 className="underline">Astar Japan Labについて</h3>
            <p>Astar 上のユースケース作成や web3 スタートアップとのコラボレーションを促進するために設立されたコンソーシアム。</p>
            <p>電通、博報堂、Microsoft、Amazon、 MUFG、SoftBank、SMBC、 Accenture、森ビル、富士通、セコムトラストシステムズなどが参画しており、事業の共創を模索している。</p>
            <h3 className="underline">Startale Labs Japan</h3>
            <ul className="list-disc">
                <li>プロダクト開発</li>
            </ul>
            <p>マルチチェーンウォレット開発。日本ユーザーの web3 ゲートウェイを抑える。理想的には既存パートナーの DOCOMO 等と提携し、デフォルトで携帯にアプリがインストールされている状態を目指す。</p>
            <ul className="list-disc">
                <li>R&amp;D / コンサルティング</li>
            </ul>
            <p>日本で唯一パブリック Layer1 チェーンを開発運用している実績を元に Layer1 を作成したい企業の支援や 周辺技術の実装やビジネス開発を行う。</p>
            <ul className="list-disc">
                <li>既存パートナーとのソリューションパッケージ提供</li>
            </ul>
            <p>Fireblocks、Circle、BitGo といった法人向けカストディーなどのソリューションや Astar 上のメタバースや NFT ソリューションをパッケージ化し、toB 向けに提供。RedHat のビジネスモデルの web3 版。</p>
        </div>
    );
};

export default Astar;