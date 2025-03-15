import { useEffect } from "react";

const base = "unsplash.com/photo";
const data = [
  {
    common: "Lion",
    binomial: "Panthera leo",
    photo: {
      code: "1583499871880-de841d1ace2a",
      page: "lion-lying-on-brown-rock-MUeeyzsjiY8",
      text: "lion couple kissing on a brown rock",
      pos: "47% 35%",
      by: "Clément Roy",
    },
  },
  // 其他数据省略...
	{
		 		common: 'Asiatic elephant', 
		 		binomial: 'Elephas maximus', 
		 		photo: {
		 			code: '1571406761758-9a3eed5338ef', 
		 			page: 'shallow-focus-photo-of-black-elephants-hZhhVLLKJQ4', 
					text: 'herd of Sri Lankan elephants walking away from a river', 
						pos: '75% 65%', 
		 			by: 'Alex Azabache'
		 		}
			}, 

];

export default function ScrollGallery() {
  useEffect(() => {
    const f = (k: number) => {
      if (Math.abs(k) > 0.5) {
        window.scrollTo(
          0,
          0.5 * (k - Math.sign(k) + 1) * (document.documentElement.offsetHeight - window.innerHeight)
        );
      }
    };
    
    f(-1);

    const handleScroll = () => {
      const k = parseFloat(getComputedStyle(document.body).getPropertyValue("--k"));
      f(k);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative flex flex-col items-center w-full min-h-screen">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold">Infinite Scroll Circular Gallery</h1>
        <strong>Scroll up & down / use up & down arrow keys</strong>
        <em className="block text-gray-500">Mostly CSS scroll-driven animations with minimal JS</em>
      </header>
      <main className="scene overflow-hidden">
        <section className="assembly grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((c, i) => {
            const img = c.photo;
            const pos = img.pos ? `center ${img.pos}` : "center";
            const url = `https://images.${base}-${img.code}?h=900`;

            return (
              <article
                key={i}
                style={{ backgroundImage: `url(${url})`, backgroundPosition: pos }}
                className="relative p-4 bg-cover bg-center border rounded-lg shadow-lg"
              >
                <header>
                  <h2 className="text-2xl font-semibold">{c.common}</h2>
                  <em className="text-gray-600">{c.binomial}</em>
                </header>
                <figure className="mt-4">
                  <img src={url} alt={img.text} className="w-full h-64 object-cover rounded-lg" />
                  <figcaption className="mt-2 text-sm text-gray-500">
                    by <a href={`https://${base}s/${img.page}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">{img.by}</a>
                  </figcaption>
                </figure>
              </article>
            );
          })}
        </section>
      </main>
      <footer className="my-8 text-gray-500">&copy; 2025 Infinite Scroll Gallery</footer>
      <aside className="box-info-scrollani text-sm p-4 bg-gray-200 rounded-md">
        Sorry, your browser does not appear to support scroll-driven animation.
      </aside>
    </div>
  );
};
