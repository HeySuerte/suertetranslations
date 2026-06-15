import Link from "next/link";

interface NovelCardProps {
  title: string;
  genre: string;
  image: string;
  slug: string;
}

export default function NovelCard({
  title,
  genre,
  image,
  slug,
}: NovelCardProps) {
  return (
    <Link
      href={`/series/${slug}`}
      className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:scale-105 transition duration-300"
    >
      <div className="h-72 overflow-hidden">
        <img
          src={image}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>

        <p className="text-gray-400 text-sm mt-1">
          {genre}
        </p>

        <button className="mt-4 w-full bg-purple-700 hover:bg-purple-600 py-2 rounded-xl transition">
          Read
        </button>
      </div>
    </Link>
  );
}