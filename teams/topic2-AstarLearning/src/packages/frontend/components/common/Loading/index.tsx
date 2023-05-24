/**
 * Loading Component
 * @returns 
 */
const Loading = (): JSX.Element => {
    return (
        <p className="h-screen w-screen flex justify-center items-center">
            <img className="h-20" src="/loading_default.svg" alt="Now loading..." />
        </p>
    );
};

export default Loading;