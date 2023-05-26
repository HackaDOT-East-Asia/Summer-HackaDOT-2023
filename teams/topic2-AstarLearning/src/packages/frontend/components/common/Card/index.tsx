import { useContractContext } from '../../../context';

/**
 * Card Component
 * 引数には、獲得したNFTのメタデータを配列にして格納する予定
 * @returns 
 */
export default function Card() {

  // create contract
  const {
    nftInfos,
  }:any = useContractContext();

  return (
    <div className="border-[#d8d2c5] dark:border-[#323943] bg-[#f4efe2] dark:bg-[#121923]">
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {nftInfos.map((nftInfo: any, i: string) => (
            <div key={i} className="group relative">
              <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:aspect-none lg:h-50">
                <img
                  src={nftInfo.image}
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div className="text-left">
                  <h3 className="text-sm text-gray-700">
                    {nftInfo.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{nftInfo.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}