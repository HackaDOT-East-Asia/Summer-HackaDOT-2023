import Header from '../common/Header';
import Footer from '../common/Footer';
import LearnCard from '../common/LearnCard';
import Link from 'next/link';
import Button from '../common/Button';
import { useContractContext } from '../../context';
import Loading from '../common/Loading';


/**
 * IndexCanvas Component
 * @returns 
 */
const IndexCanvas = () => {

  // create contract
  const {
    connectWallet,
    actingAddress,
    isLoading
  }:any = useContractContext();

  return (
    <div className="text-center">
      <Header />
      {actingAddress !== '' ?
        <>
          {isLoading ? 
            <Loading/>
          : (
            <>
              <h2 className="text-2xl font-bold tracking-tight mb-5 text-white-900">Learning Courses</h2>
              <LearnCard/>
              <div className="mt-5 mb-5"></div>
              <Link href="/nfts">
                <Button name="View Your NFT" />
              </Link>
              &nbsp;
              <Button 
                name="refresh" 
                onClick={() => connectWallet()}
              />
            </>
          )}
        </>
      :  
        <h2 
          className="text-2xl font-bold tracking-tight h-screen w-screen flex justify-center items-center text-white-900"
        >
          Please connect wallet
        </h2>
      }
      <Footer />
    </div>
  );
};

export default IndexCanvas;