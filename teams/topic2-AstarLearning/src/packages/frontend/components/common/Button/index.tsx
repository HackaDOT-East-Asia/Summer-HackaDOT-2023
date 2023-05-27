/**
 * Button component
 * @param name ボタンの名前
 * @param onClick クリック時に実行したい処理
 */
const Button = (props: any) => {

    const {
        name,
        onClick
    } = props;

    return (
        <button
            className="bg-[#184e9b] hover:bg-[#2974df] hover:duration-500 disabled:bg-[#a4a095] dark:disabled:bg-stone-700 text-white rounded px-4 py-2"
            onClick={onClick}
        >
            {name}
        </button>
    );
};

export default Button;