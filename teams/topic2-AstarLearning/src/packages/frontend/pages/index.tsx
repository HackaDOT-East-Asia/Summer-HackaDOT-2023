import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Loading from '../components/common/Loading';

const IndexCanvas = dynamic(() => import('../components/IndexCanvas'), {
  ssr: false,
  loading: () => <Loading/>,
})

const IndexPage: NextPage = () => {
  return (
    <main className="bg-[#ffffff] dark:bg-[#0d1117] text-[#1d2127] dark:text-[#f0eee0]">
      <IndexCanvas />
    </main>
  )
};

export default IndexPage;