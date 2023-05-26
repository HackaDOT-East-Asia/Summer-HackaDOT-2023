/**
 * ConnectButton component
 * @param onClick クリック時に実行したい処理
 */
const ConnectButton = (props: any) => {

    const {
        onClick
    } = props;

    return (
        <button
            className="bg-[#34cfd7] hover:bg-[#4586e2] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2 mr-3"
            onClick={onClick}
        >
            ConnectWallet
        </button>
    );
};

export default ConnectButton;