import './UseCase.css';
import CircularGallery from '../CircularGallery';

export default function UseCase() {
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} />
    </div>
  );
}