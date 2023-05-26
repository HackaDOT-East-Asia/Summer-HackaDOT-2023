import Button from "../Button";
import Link from 'next/link';

import { useContractContext, ContentInfo } from '../../../context';

/**
 * Card Component
 * 引数には、獲得したNFTのメタデータを配列にして格納する予定
 * @returns 
 */
export default function Card() {
    // create contract
    const {
        contentInfos,
    }:any = useContractContext();

    // Search content
    console.log("contentInfos", contentInfos);

    return (
      <div className="border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923]">
        <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {contentInfos.map((content:any) => (
              <div key={content.content_id} className="group relative">
                <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-50">
                  <img
                    src={content.image_url}
                    alt=''
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-left text-sm text-gray-700">
                      <a href="#">
                        <span aria-hidden="true" className="ml-0" />
                        {content.title}
                      </a>
                    </h3>
                    <div 
                      className="mt-1 text-left text-sm text-gray-500" 
                      dangerouslySetInnerHTML={{ __html: content.intro}} 
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  {content.goods} 👍
                </div>
                <div className="mt-4 flex justify-between">
                  <Link href={{ pathname: '/learn', query: { contentFlg: `${content.content_id}` } }}>
                    <Button name="Learn More →" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
}
