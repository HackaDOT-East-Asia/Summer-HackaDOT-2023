
import {TWITTER_URL} from '../Constant';

/**
 * Footer Component
 * @returns 
 */
const Footer = (): JSX.Element => {
  return (
    <div className="m-5">
      <img className='h-20 w-20 mx-auto' src="/Astar_ring.png"/>
      built by <a href={TWITTER_URL}>Astar Learning Team</a>
    </div>
  );
};

export default Footer;