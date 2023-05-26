import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Loading from '../../components/common/Loading';

const LearnCanvas = dynamic(() => import('../../components/LearnCanvas'), {
  ssr: false,
  loading: () => <Loading/>,
})

const IndexPage: NextPage = (props: any) => {

  const {
    contentFlg
  } = props;

  return (
    <main className="bg-[#ffffff] dark:bg-[#0d1117] text-[#1d2127] dark:text-[#f0eee0]">
      <LearnCanvas />
    </main>
  )
};

export default IndexPage;