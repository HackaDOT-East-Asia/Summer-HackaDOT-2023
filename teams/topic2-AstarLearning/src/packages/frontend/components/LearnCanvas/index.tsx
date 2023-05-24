import Button from "../common/Button";
import Header from '../common/Header';
import Footer from '../common/Footer';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContractContext } from '../../context';
import Loading from "../common/Loading";

import { useState } from "react";
import QuizModal from "./QuizModal";

/**
 * LearnCanvas Component
 * @returns 
 */
const LearnCanvas = () => {
    // state
    const [isOpenModal, setOpenModal] = useState(false);

    const router = useRouter();
    // クエリパラメータから値を取得する。
    const { contentFlg } = router.query;

    // create contract
    const {
        actingAddress,
        mint,
        good,
        quiz,
        cheer,
        isLoading,
        contentInfos,
    }:any = useContractContext();

    // Search content
    let content:any = null;

    contentInfos.map((e:any) => {
      if (contentFlg != e.content_id) {
        return;
      }
      content = e;
    });

    return (
        <div className="text-center">
            <Header />
            {actingAddress !== '' ?
                <>
                    {isLoading ? 
                        <Loading/>
                    :
                        <>
                            <h2 className="text-2xl font-bold tracking-tight mb-5 text-white-900">Learning Page</h2>
                              <div className="text-left flex flex-wrap justify-center bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                              {content == null ? 
                                <div className="my-5">
                                  <h2 className="my-5 text-5xl">Not Found.</h2>
                                </div>
                                :
                                <>
                                  <a href="#" className="py-10 w-2/6">
                                    <img className="mx-auto rounded-t-lg" src={content.image_url} alt={content.title} />
                                  </a>
                                  <div className="p-5 w-3/4">
                                    <a href="#">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            {content.title} Learing Course
                                        </h5>
                                    </a>
                                    <div className="content-container mb-3 text-gray-700 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: content.content}} />
                                    <div className="text-center mb-5">
                                        <Button 
                                            name="Good" 
                                            onClick={() => good(contentFlg)}
                                        />
                                        &nbsp;
                                        <Button 
                                            name="Quiz" 
                                            onClick={() => setOpenModal(true)}
                                        />
                                        &nbsp;
                                        <Button 
                                            name="Cheer" 
                                            onClick={() => cheer(contentFlg)}
                                        />
                                    </div>
                                  </div>
                                  <QuizModal 
                                    isOpen={isOpenModal} 
                                    onRequestClose={() => setOpenModal(false)} 
                                    ariaHideApp={false} 
                                    statement={content.statement}
                                    quizs={content.quizs} 
                                    answer={content.answer} 
                                    intro={content.intro} 
                                    onMintNft={() => mint(content.content_id)} 
                                  />
                                </>
                              }
                            </div> 
                            <div className="mt-5 mb-5"></div>
                            <Link href="/">
                                <Button name="return to Top" />
                            </Link>
                      </> 
                    }
                </>
            :
                <h2 className="text-2xl font-bold tracking-tight h-screen w-screen flex justify-center items-center text-white-900">Please connect wallet</h2>
            }  
            <Footer />
        </div>
    );
};

export default LearnCanvas;
