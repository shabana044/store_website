import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="boutique-hero">
      <div className="boutique-hero-content">
        <p className="hero-mini-text">Timeless • Elegant • Affordable</p>

        <h1>
          Because every outfit deserves
          <span> a little elegance.</span>
        </h1>

        <p className="boutique-hero-text">
          Discover graceful dresses made for college days, casual outings,
          celebrations, and every beautiful moment in between.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="primary-btn">
            Shop Now
          </Link>

          <Link to="/products" className="secondary-btn">
            Explore Collection
          </Link>
        </div>
      </div>

      <div className="boutique-hero-image-area">
       

        <img
          src="/boutique-hero.png"
          alt="Boutique dress collection"
          className="boutique-hero-image"
        />

        
      </div>
    </section>
  );
}

export default Home;