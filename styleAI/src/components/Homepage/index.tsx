import './Homepage.css';
import Header from '../Header';
import Background from '../Background';

export default function Homepage() {
  return (
    <div className="homepage">
      <Background />
      <div className="container">
        <Header />
      </div>
    </div>
  )
}
