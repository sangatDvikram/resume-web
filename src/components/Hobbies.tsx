import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight, Music, BookOpen, Heart, Tv } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Photography images
const photos = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    title: "Mountain Sunrise",
    location: "Himalayas, India",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    title: "Forest Path",
    location: "Western Ghats",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop",
    title: "Serene Lake",
    location: "Kashmir",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop",
    title: "Golden Fields",
    location: "Punjab",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    title: "City Lights",
    location: "Bangalore",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1518173946687-a4c036bc4b66?w=800&h=600&fit=crop",
    title: "Coastal Sunset",
    location: "Goa",
  },
];

// Music preferences
const musicGenres = [
  { name: "Rock", icon: "🎸", description: "Classic and alternative rock" },
  { name: "Electronic", icon: "🎧", description: "EDM and ambient sounds" },
  { name: "Jazz", icon: "🎷", description: "Smooth jazz and fusion" },
  { name: "Classical", icon: "🎻", description: "Orchestral and piano" },
  { name: "Indie", icon: "🎤", description: "Independent artists" },
  { name: "World", icon: "🌍", description: "Global and cultural music" },
];

const favoriteArtists = [
  "Pink Floyd", "Radiohead", "Hans Zimmer", "Daft Punk", "A.R. Rahman", "Coldplay"
];

// Reading preferences
const bookCategories = [
  { name: "Technology", icon: "💻", count: 25 },
  { name: "Science Fiction", icon: "🚀", count: 40 },
  { name: "Philosophy", icon: "🧠", count: 15 },
  { name: "Biography", icon: "📖", count: 20 },
  { name: "Self-Help", icon: "🌱", count: 12 },
  { name: "History", icon: "🏛️", count: 18 },
];

const favoriteBooks = [
  { title: "Clean Code", author: "Robert C. Martin" },
  { title: "Sapiens", author: "Yuval Noah Harari" },
  { title: "The Pragmatic Programmer", author: "David Thomas" },
  { title: "1984", author: "George Orwell" },
  { title: "Atomic Habits", author: "James Clear" },
  { title: "The Alchemist", author: "Paulo Coelho" },
];

// Anime preferences
const animeGenres = [
  { name: "Shonen", icon: "⚔️", description: "Action-packed adventures" },
  { name: "Seinen", icon: "🎭", description: "Mature themes and stories" },
  { name: "Sci-Fi", icon: "🤖", description: "Futuristic worlds" },
  { name: "Thriller", icon: "🔍", description: "Suspense and mystery" },
  { name: "Fantasy", icon: "🐉", description: "Magical realms" },
  { name: "Slice of Life", icon: "🌸", description: "Everyday moments" },
];

const favoriteAnime = [
  { title: "Attack on Titan", rating: "10/10" },
  { title: "Death Note", rating: "10/10" },
  { title: "Steins;Gate", rating: "9.5/10" },
  { title: "Fullmetal Alchemist: Brotherhood", rating: "10/10" },
  { title: "Code Geass", rating: "9/10" },
  { title: "One Punch Man", rating: "9/10" },
];

const Hobbies = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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

  return (
    <section id="hobbies" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(174_72%_56%_/_0.05)_0%,transparent_60%)]" />
      
      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-sm font-mono text-primary mb-4 tracking-wider uppercase flex items-center justify-center gap-2">
            <Heart className="w-4 h-4" />
            Beyond Code
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">Hobbies & Interests</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            When I'm not coding, I enjoy exploring the world through different lenses—be it photography, music, or books.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="photography" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 mb-8 bg-background/50 backdrop-blur-sm border border-primary/10">
              <TabsTrigger value="photography" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Photography</span>
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Music</span>
              </TabsTrigger>
              <TabsTrigger value="reading" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Reading</span>
              </TabsTrigger>
              <TabsTrigger value="anime" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Tv className="w-4 h-4" />
                <span className="hidden sm:inline">Anime</span>
              </TabsTrigger>
            </TabsList>

            {/* Photography Tab */}
            <TabsContent value="photography" className="mt-0">
              <div className="max-w-5xl mx-auto px-12">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {photos.map((photo, index) => (
                      <CarouselItem key={photo.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
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
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                <Camera className="w-5 h-5 text-primary" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/20 hover:text-primary" />
                  <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/20 hover:text-primary" />
                </Carousel>
              </div>
            </TabsContent>

            {/* Music Tab */}
            <TabsContent value="music" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {musicGenres.map((genre, index) => (
                    <motion.div
                      key={genre.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="glass glass-hover rounded-xl p-4 text-center group cursor-pointer"
                    >
                      <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform duration-300">{genre.icon}</span>
                      <h4 className="font-semibold text-foreground">{genre.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{genre.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="glass rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    Favorite Artists
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {favoriteArtists.map((artist, index) => (
                      <motion.span
                        key={artist}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                        className="skill-chip"
                      >
                        {artist}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* Reading Tab */}
            <TabsContent value="reading" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {bookCategories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="glass glass-hover rounded-xl p-4 text-center group cursor-pointer"
                    >
                      <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform duration-300">{category.icon}</span>
                      <h4 className="font-semibold text-foreground">{category.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{category.count}+ books read</p>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="glass rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Favorite Books
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favoriteBooks.map((book, index) => (
                      <motion.div
                        key={book.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <span className="text-2xl">📚</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{book.title}</p>
                          <p className="text-xs text-muted-foreground">{book.author}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            {/* Anime Tab */}
            <TabsContent value="anime" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {animeGenres.map((genre, index) => (
                    <motion.div
                      key={genre.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="glass glass-hover rounded-xl p-4 text-center group cursor-pointer"
                    >
                      <span className="text-3xl mb-2 block group-hover:scale-125 transition-transform duration-300">{genre.icon}</span>
                      <h4 className="font-semibold text-foreground">{genre.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{genre.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="glass rounded-xl p-6"
                >
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-primary" />
                    Favorite Anime
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favoriteAnime.map((anime, index) => (
                      <motion.div
                        key={anime.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <span className="text-2xl">🎬</span>
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{anime.title}</p>
                          <p className="text-xs text-muted-foreground">Rating: {anime.rating}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedImage !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={handlePrevImage}
                className="absolute left-4 z-10 p-3 rounded-full bg-background/50 backdrop-blur-sm hover:bg-primary/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="w-full h-full p-8 flex flex-col items-center justify-center">
                <img
                  src={photos[selectedImage].src.replace('w=800&h=600', 'w=1600&h=1200')}
                  alt={photos[selectedImage].title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
                <div className="mt-4 text-center">
                  <h4 className="text-xl font-semibold">{photos[selectedImage].title}</h4>
                  <p className="text-muted-foreground">{photos[selectedImage].location}</p>
                </div>
              </div>

              <button
                onClick={handleNextImage}
                className="absolute right-4 z-10 p-3 rounded-full bg-background/50 backdrop-blur-sm hover:bg-primary/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
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
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hobbies;
