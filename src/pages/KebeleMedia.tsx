import React, { useState } from 'react';
import { Image, X, Calendar, Tag } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
}

// Mock media data
const mockMedia: MediaItem[] = [
  {
    id: "1",
    title: "Traditional Ethiopian Wedding",
    description: "Beautiful celebration of love and culture in the highlands",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    category: "Culture",
    date: "2024-10-15"
  },
  {
    id: "2",
    title: "Coffee Ceremony in Action",
    description: "The ancient ritual of Ethiopian coffee preparation",
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop",
    category: "Tradition",
    date: "2024-09-22"
  },
  {
    id: "3",
    title: "Ethiopian Orthodox Church",
    description: "Sacred architecture and spiritual atmosphere",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    category: "Religion",
    date: "2024-08-30"
  },
  {
    id: "4",
    title: "Market Day in Addis Ababa",
    description: "Vibrant local markets showcasing Ethiopian craftsmanship",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    category: "Commerce",
    date: "2024-07-18"
  },
  {
    id: "5",
    title: "Simien Mountains Landscape",
    description: "Breathtaking natural beauty of Ethiopia's highlands",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
    category: "Nature",
    date: "2024-06-12"
  },
  {
    id: "6",
    title: "Traditional Music Performance",
    description: "Azmari musicians bringing ancient melodies to life",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    category: "Music",
    date: "2024-05-28"
  },
  {
    id: "7",
    title: "Ethiopian Textile Art",
    description: "Intricate patterns and vibrant colors of traditional weaving",
    imageUrl: "https://images.unsplash.com/photo-1601762603332-db5e4b90cc5d?w=600&h=400&fit=crop",
    category: "Art",
    date: "2024-04-15"
  },
  {
    id: "8",
    title: "Children at Play",
    description: "Joyful moments of Ethiopian youth in traditional settings",
    imageUrl: "https://images.unsplash.com/photo-1524503033411-c9566986fc8d?w=600&h=400&fit=crop",
    category: "Community",
    date: "2024-03-20"
  }
];

const KebeleMedia: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Simple header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kebele <span className="text-purple-600">Media Gallery</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the visual tapestry of Ethiopian culture through our curated collection of photographs.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMedia.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    {item.category}
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default KebeleMedia;