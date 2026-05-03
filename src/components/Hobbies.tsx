import { useState, useRef, useEffect } from "react";
import { RESUME } from "@/constants";

const { photos, musicGenres, favoriteArtists, bookCategories, favoriteBooks, animeGenres, favoriteAnime, tabs } = RESUME.hobbies;

const Hobbies = () => {
  const [activeTab, setActiveTab] = useState("photography");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handlePrevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? photos.length - 1 : selectedImage - 1);
    }
  };

  const handleNextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === photos.length - 1 ? 0 : selectedImage + 1);
    }
  };

  useEffect(() => {
    if (selectedImage !== null) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [selectedImage]);



  return (
    <section id="hobbies" className="py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--teal-glow)_/_0.05)_0%,transparent_60%)]" />

      <div className="section-container relative">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase flex items-center justify-center gap-2">
            <span>❤️</span>
            Beyond Code
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">Hobbies & Interests</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            When I'm not coding, I enjoy exploring the world through different lenses—be it photography, music, or books.
          </p>
        </div>

        <div className="animate-fade-in">
          {/* Custom Tabs */}
          <div className="grid w-full max-w-lg mx-auto grid-cols-4 mb-8 bg-background/50 backdrop-blur-sm border border-primary/10 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Photography Tab */}
          {activeTab === "photography" && (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedImage(index)}
                  >
                    <div className="relative overflow-hidden rounded-xl glass glass-hover aspect-[4/3]">
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="font-semibold text-foreground">{photo.title}</h4>
                        <p className="text-sm text-muted-foreground">{photo.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Music Tab */}
          {activeTab === "music" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {musicGenres.map((genre) => (
                  <div
                    key={genre.name}
                    className="glass glass-hover rounded-xl p-4 text-center group cursor-pointer"
                  >
                    <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform duration-300">{genre.icon}</span>
                    <h4 className="font-semibold text-foreground">{genre.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{genre.description}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🎵</span>
                  Favorite Artists
                </h4>
                <div className="flex flex-wrap gap-2">
                  {favoriteArtists.map((artist) => (
                    <span key={artist} className="skill-chip">
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reading Tab */}
          {activeTab === "reading" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {bookCategories.map((category) => (
                  <div
                    key={category.name}
                    className="glass glass-hover rounded-xl p-4 text-center group cursor-pointer"
                  >
                    <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform duration-300">{category.icon}</span>
                    <h4 className="font-semibold text-foreground">{category.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{category.count}+ books read</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📚</span>
                  Favorite Books
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteBooks.map((book) => (
                    <div
                      key={book.title}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <span className="text-2xl">📖</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Anime Tab */}
          {activeTab === "anime" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {animeGenres.map((genre) => (
                  <div
                    key={genre.name}
                    className="glass glass-hover rounded-xl p-4 text-center group cursor-pointer"
                  >
                    <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform duration-300">{genre.icon}</span>
                    <h4 className="font-semibold text-foreground">{genre.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{genre.description}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>📺</span>
                  Favorite Anime
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteAnime.map((anime) => (
                    <div
                      key={anime.title}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      <span className="text-2xl">🎬</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{anime.title}</p>
                        <p className="text-xs text-muted-foreground">Rating: {anime.rating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Dialog using native dialog element */}
      <dialog
        ref={dialogRef}
        className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl"
        onClose={() => setSelectedImage(null)}
      >
        {selectedImage !== null && (
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={handlePrevImage}
              className="absolute left-4 z-10 p-3 rounded-full bg-background/50 backdrop-blur-sm hover:bg-primary/20 transition-colors"
            >
              <span className="text-xl text-foreground">←</span>
            </button>

            <div className="w-full h-full p-8 flex flex-col items-center justify-center">
              <img
                src={photos[selectedImage].src.replace('w=800&h=600', 'w=1600&h=1200')}
                alt={photos[selectedImage].title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                <h4 className="text-xl font-semibold text-foreground">{photos[selectedImage].title}</h4>
                <p className="text-muted-foreground">{photos[selectedImage].location}</p>
              </div>
            </div>

            <button
              onClick={handleNextImage}
              className="absolute right-4 z-10 p-3 rounded-full bg-background/50 backdrop-blur-sm hover:bg-primary/20 transition-colors"
            >
              <span className="text-xl text-foreground">→</span>
            </button>

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-primary/20 transition-colors"
            >
              <span className="text-xl text-foreground">✕</span>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedImage
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
};

export default Hobbies;
